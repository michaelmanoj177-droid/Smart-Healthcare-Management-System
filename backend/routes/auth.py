from datetime import datetime, timezone
import re
from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend.db import get_db
from backend.utils.auth_helpers import hash_password, verify_password, role_required
from backend.utils.serializers import serialize_doc, to_object_id
from backend.utils.audit import log_audit, create_notification

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")
    role = data.get("role", "patient").strip().lower()

    # Public admin registration rejection
    if role == "admin":
        return jsonify({"error": "Forbidden", "message": "Public administrator registration is not permitted."}), 403

    if role not in ["patient", "doctor"]:
        return jsonify({"error": "Bad Request", "message": "Invalid role specified."}), 400

    if not full_name or not email or not password:
        return jsonify({"error": "Bad Request", "message": "Full name, email, and password are required."}), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Bad Request", "message": "Invalid email address format."}), 400

    if len(password) < 6:
        return jsonify({"error": "Bad Request", "message": "Password must be at least 6 characters."}), 400

    if password != confirm_password:
        return jsonify({"error": "Bad Request", "message": "Passwords do not match."}), 400

    db = get_db()

    # Check for existing user
    if db.users.find_one({"email": email}):
        return jsonify({"error": "Conflict", "message": "An account with this email address already exists."}), 409

    now = datetime.now(timezone.utc)
    account_status = "pending_verification" if role == "doctor" else "active"

    user_doc = {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "password_hash": hash_password(password),
        "role": role,
        "account_status": account_status,
        "created_at": now,
        "updated_at": now
    }

    try:
        user_res = db.users.insert_one(user_doc)
        user_id = user_res.inserted_id

        if role == "patient":
            patient_profile = {
                "user_id": user_id,
                "date_of_birth": data.get("date_of_birth", ""),
                "gender": data.get("gender", ""),
                "emergency_contact": data.get("emergency_contact", ""),
                "allergies": data.get("allergies", ""),
                "blood_group": data.get("blood_group", ""),
                "created_at": now,
                "updated_at": now
            }
            db.patient_profiles.insert_one(patient_profile)
            create_notification(
                user_id,
                "Welcome to Smart Healthcare!",
                "Your patient account has been created successfully. You can now book appointments and access digital health services.",
                "general"
            )

        elif role == "doctor":
            dept_id = data.get("department_id")
            doctor_profile = {
                "user_id": user_id,
                "specialization": data.get("specialization", "General Medicine"),
                "qualifications": data.get("qualifications", "MBBS"),
                "experience_years": int(data.get("experience_years", 1)),
                "professional_registration_number": data.get("professional_registration_number", "").strip(),
                "verification_status": "pending",
                "department_id": to_object_id(dept_id) if dept_id else None,
                "consultation_fee": float(data.get("consultation_fee", 50.0)),
                "biography": data.get("biography", ""),
                "profile_image": data.get("profile_image", ""),
                "created_at": now,
                "updated_at": now
            }
            db.doctor_profiles.insert_one(doctor_profile)

            # Insert default availability schedule (Mon-Fri 09:00 - 17:00, 30 min slots)
            for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
                db.doctor_availability.insert_one({
                    "doctor_id": user_id,
                    "day_of_week": day,
                    "start_time": "09:00",
                    "end_time": "17:00",
                    "slot_duration_minutes": 30,
                    "is_available": True
                })

            create_notification(
                user_id,
                "Doctor Application Received",
                "Your application has been received and is pending administrator review and credential verification.",
                "verification"
            )

        log_audit(user_id, "USER_REGISTER", "user", user_id, {"role": role, "email": email})

        # Generate token for active users; pending doctors get notice
        token = None
        if account_status == "active":
            token = create_access_token(identity=str(user_id), additional_claims={"role": role, "name": full_name})

        return jsonify({
            "message": "Registration successful." + (" Your doctor account is pending administrator verification." if role == "doctor" else ""),
            "access_token": token,
            "user": serialize_doc(user_doc)
        }), 201

    except Exception as e:
        return jsonify({"error": "Internal Error", "message": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Bad Request", "message": "Email and password are required."}), 400

    db = get_db()
    user = db.users.find_one({"email": email})

    if not user or not verify_password(password, user.get("password_hash", "")):
        return jsonify({"error": "Unauthorized", "message": "Invalid email or password."}), 401

    if user.get("account_status") == "inactive":
        return jsonify({"error": "Forbidden", "message": "Your account has been deactivated. Please contact administrator."}), 403

    # Fetch corresponding profile
    role = user.get("role")
    profile = None
    if role == "doctor":
        profile = db.doctor_profiles.find_one({"user_id": user["_id"]})
        # Check doctor verification
        if profile and profile.get("verification_status") == "pending":
            return jsonify({
                "error": "Pending Verification",
                "message": "Your doctor credentials are under review by the administration. You will be able to log in once verified.",
                "verification_status": "pending"
            }), 403
        elif profile and profile.get("verification_status") == "rejected":
            return jsonify({
                "error": "Verification Rejected",
                "message": "Your doctor application was rejected. Please contact administrator.",
                "verification_status": "rejected"
            }), 403

    elif role == "patient":
        profile = db.patient_profiles.find_one({"user_id": user["_id"]})

    access_token = create_access_token(
        identity=str(user["_id"]),
        additional_claims={"role": role, "name": user.get("full_name")}
    )

    log_audit(user["_id"], "USER_LOGIN", "user", user["_id"])

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": serialize_doc(user),
        "profile": serialize_doc(profile)
    }), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    db = get_db()
    user = db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        return jsonify({"error": "Not Found", "message": "User not found."}), 404

    profile = None
    if user.get("role") == "doctor":
        profile = db.doctor_profiles.find_one({"user_id": user["_id"]})
        if profile and profile.get("department_id"):
            dept = db.departments.find_one({"_id": profile["department_id"]})
            if dept:
                profile["department_name"] = dept.get("name")
    elif user.get("role") == "patient":
        profile = db.patient_profiles.find_one({"user_id": user["_id"]})

    return jsonify({
        "user": serialize_doc(user),
        "profile": serialize_doc(profile)
    }), 200

@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    db = get_db()
    user = db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        return jsonify({"error": "Not Found", "message": "User not found."}), 404

    data = request.get_json() or {}
    now = datetime.now(timezone.utc)

    # Update basic user fields
    user_updates = {"updated_at": now}
    if "full_name" in data and data["full_name"].strip():
        user_updates["full_name"] = data["full_name"].strip()
    if "phone" in data:
        user_updates["phone"] = data["phone"].strip()

    db.users.update_one({"_id": user["_id"]}, {"$set": user_updates})

    # Update role-specific profile
    if user.get("role") == "patient":
        profile_updates = {"updated_at": now}
        for field in ["date_of_birth", "gender", "emergency_contact", "allergies", "blood_group"]:
            if field in data:
                profile_updates[field] = data[field]
        db.patient_profiles.update_one({"user_id": user["_id"]}, {"$set": profile_updates}, upsert=True)

    elif user.get("role") == "doctor":
        profile_updates = {"updated_at": now}
        for field in ["biography", "profile_image", "specialization", "qualifications"]:
            if field in data:
                profile_updates[field] = data[field]
        if "consultation_fee" in data:
            try:
                profile_updates["consultation_fee"] = float(data["consultation_fee"])
            except ValueError:
                pass
        if "experience_years" in data:
            try:
                profile_updates["experience_years"] = int(data["experience_years"])
            except ValueError:
                pass
        db.doctor_profiles.update_one({"user_id": user["_id"]}, {"$set": profile_updates}, upsert=True)

    log_audit(user["_id"], "PROFILE_UPDATE", "user", user["_id"])
    return jsonify({"message": "Profile updated successfully."}), 200

@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    db = get_db()
    user = db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        return jsonify({"error": "Not Found", "message": "User not found."}), 404

    data = request.get_json() or {}
    old_password = data.get("current_password", "")
    new_password = data.get("new_password", "")
    confirm_password = data.get("confirm_password", "")

    if not verify_password(old_password, user.get("password_hash", "")):
        return jsonify({"error": "Unauthorized", "message": "Current password is incorrect."}), 400

    if len(new_password) < 6:
        return jsonify({"error": "Bad Request", "message": "New password must be at least 6 characters."}), 400

    if new_password != confirm_password:
        return jsonify({"error": "Bad Request", "message": "New passwords do not match."}), 400

    db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": hash_password(new_password), "updated_at": datetime.now(timezone.utc)}}
    )

    log_audit(user["_id"], "CHANGE_PASSWORD", "user", user["_id"])
    return jsonify({"message": "Password changed successfully."}), 200

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    log_audit(user_id, "USER_LOGOUT", "user", user_id)
    return jsonify({"message": "Logged out successfully."}), 200
