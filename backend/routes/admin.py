from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.db import get_db
from backend.utils.serializers import serialize_doc, serialize_docs, to_object_id
from backend.utils.auth_helpers import role_required
from backend.utils.audit import log_audit, create_notification

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/stats", methods=["GET"])
@role_required("admin")
def get_stats():
    db = get_db()

    total_patients = db.users.count_documents({"role": "patient"})
    total_doctors = db.users.count_documents({"role": "doctor"})
    verified_doctors = db.doctor_profiles.count_documents({"verification_status": "verified"})
    pending_doctors = db.doctor_profiles.count_documents({"verification_status": "pending"})

    total_appointments = db.appointments.count_documents({})
    upcoming_appointments = db.appointments.count_documents({"status": {"$in": ["pending", "confirmed"]}})
    completed_appointments = db.appointments.count_documents({"status": "completed"})
    cancelled_appointments = db.appointments.count_documents({"status": "cancelled"})

    # Appointments by status for chart
    status_counts = {}
    for st in ["pending", "confirmed", "completed", "cancelled", "rejected"]:
        status_counts[st] = db.appointments.count_documents({"status": st})

    # Doctor distribution by specialization
    doc_profiles = list(db.doctor_profiles.find({}, {"specialization": 1}))
    spec_counts = {}
    for dp in doc_profiles:
        sp = dp.get("specialization", "General")
        spec_counts[sp] = spec_counts.get(sp, 0) + 1

    return jsonify({
        "stats": {
            "total_patients": total_patients,
            "total_doctors": total_doctors,
            "verified_doctors": verified_doctors,
            "pending_doctors": pending_doctors,
            "total_appointments": total_appointments,
            "upcoming_appointments": upcoming_appointments,
            "completed_appointments": completed_appointments,
            "cancelled_appointments": cancelled_appointments,
            "status_breakdown": [{"name": k.title(), "count": v} for k, v in status_counts.items()],
            "specialization_breakdown": [{"specialization": k, "count": v} for k, v in spec_counts.items()]
        }
    }), 200

# User Management (Patients & Doctors)
@admin_bp.route("/users", methods=["GET"])
@role_required("admin")
def get_users():
    db = get_db()
    role_filter = request.args.get("role")
    search = request.args.get("search", "").strip()

    query = {}
    if role_filter:
        query["role"] = role_filter
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]

    users = list(db.users.find(query).sort("created_at", -1))
    
    # Enrich doctors with verification status
    enriched_users = []
    for u in users:
        u_data = serialize_doc(u)
        if u.get("role") == "doctor":
            doc_p = db.doctor_profiles.find_one({"user_id": u["_id"]})
            if doc_p:
                u_data["verification_status"] = doc_p.get("verification_status")
                u_data["specialization"] = doc_p.get("specialization")
                u_data["experience_years"] = doc_p.get("experience_years")
                u_data["registration_number"] = doc_p.get("professional_registration_number")
        enriched_users.append(u_data)

    return jsonify({"users": enriched_users}), 200

@admin_bp.route("/users/<user_id>/status", methods=["PUT"])
@role_required("admin")
def update_user_status(user_id):
    admin_id = get_jwt_identity()
    db = get_db()
    u_oid = to_object_id(user_id)
    user = db.users.find_one({"_id": u_oid})
    if not user:
        return jsonify({"error": "Not Found", "message": "User not found."}), 404

    data = request.get_json() or {}
    new_status = data.get("account_status")
    if new_status not in ["active", "inactive"]:
        return jsonify({"error": "Bad Request", "message": "Status must be active or inactive."}), 400

    db.users.update_one({"_id": u_oid}, {"$set": {"account_status": new_status, "updated_at": datetime.now(timezone.utc)}})
    
    log_audit(to_object_id(admin_id), "UPDATE_USER_STATUS", "user", u_oid, {"new_status": new_status})
    create_notification(
        u_oid,
        f"Account Status Changed: {new_status.title()}",
        f"Your account status has been updated to {new_status} by system administration.",
        "general"
    )

    return jsonify({"message": f"User status updated to {new_status}."}), 200

# Doctor Verification
@admin_bp.route("/doctors/pending", methods=["GET"])
@role_required("admin")
def get_pending_doctors():
    db = get_db()
    pending_profiles = list(db.doctor_profiles.find({"verification_status": "pending"}))
    
    results = []
    for p in pending_profiles:
        u = db.users.find_one({"_id": p["user_id"]})
        if u:
            dept_name = "General"
            if p.get("department_id"):
                d = db.departments.find_one({"_id": p["department_id"]})
                if d:
                    dept_name = d.get("name")
            results.append({
                "doctor_profile_id": str(p["_id"]),
                "user_id": str(u["_id"]),
                "name": u.get("full_name"),
                "email": u.get("email"),
                "phone": u.get("phone"),
                "specialization": p.get("specialization"),
                "qualifications": p.get("qualifications"),
                "experience_years": p.get("experience_years"),
                "registration_number": p.get("professional_registration_number"),
                "department_name": dept_name,
                "consultation_fee": p.get("consultation_fee"),
                "biography": p.get("biography"),
                "created_at": p.get("created_at")
            })

    return jsonify({"pending_doctors": results}), 200

@admin_bp.route("/doctors/<doctor_user_id>/verify", methods=["PUT"])
@role_required("admin")
def verify_doctor(doctor_user_id):
    admin_id = get_jwt_identity()
    db = get_db()
    d_oid = to_object_id(doctor_user_id)
    doctor = db.users.find_one({"_id": d_oid, "role": "doctor"})
    if not doctor:
        return jsonify({"error": "Not Found", "message": "Doctor not found."}), 404

    data = request.get_json() or {}
    decision = data.get("decision") # "verified" or "rejected"
    reason = data.get("reason", "")

    if decision not in ["verified", "rejected"]:
        return jsonify({"error": "Bad Request", "message": "Decision must be 'verified' or 'rejected'."}), 400

    now = datetime.now(timezone.utc)
    new_acc_status = "active" if decision == "verified" else "inactive"

    db.doctor_profiles.update_one(
        {"user_id": d_oid},
        {"$set": {"verification_status": decision, "verification_notes": reason, "updated_at": now}}
    )
    db.users.update_one(
        {"_id": d_oid},
        {"$set": {"account_status": new_acc_status, "updated_at": now}}
    )

    log_audit(to_object_id(admin_id), "DOCTOR_VERIFICATION", "doctor_profile", d_oid, {
        "decision": decision,
        "reason": reason
    })

    if decision == "verified":
        create_notification(
            d_oid,
            "Credentials Verified! 🩺",
            "Congratulations! Your doctor credentials have been verified by administration. You can now receive and manage patient consultations.",
            "verification"
        )
    else:
        create_notification(
            d_oid,
            "Verification Update",
            f"Your doctor credentials verification was not approved: {reason}",
            "verification"
        )

    return jsonify({"message": f"Doctor credentials marked as {decision}."}), 200

# Department Management
@admin_bp.route("/departments", methods=["GET"])
@role_required("admin")
def list_departments():
    db = get_db()
    depts = list(db.departments.find({}))
    return jsonify({"departments": serialize_docs(depts)}), 200

@admin_bp.route("/departments", methods=["POST"])
@role_required("admin")
def create_department():
    admin_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    description = data.get("description", "").strip()

    if not name:
        return jsonify({"error": "Bad Request", "message": "Department name is required."}), 400

    if db.departments.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}}):
        return jsonify({"error": "Conflict", "message": "Department already exists."}), 409

    dept = {
        "name": name,
        "description": description,
        "status": "active"
    }
    res = db.departments.insert_one(dept)
    log_audit(to_object_id(admin_id), "CREATE_DEPARTMENT", "department", res.inserted_id, {"name": name})

    return jsonify({"message": "Department created.", "department": serialize_doc(dept)}), 201

@admin_bp.route("/departments/<dept_id>", methods=["PUT"])
@role_required("admin")
def update_department(dept_id):
    admin_id = get_jwt_identity()
    db = get_db()
    d_oid = to_object_id(dept_id)
    dept = db.departments.find_one({"_id": d_oid})
    if not dept:
        return jsonify({"error": "Not Found", "message": "Department not found."}), 404

    data = request.get_json() or {}
    updates = {}
    if "name" in data and data["name"].strip():
        updates["name"] = data["name"].strip()
    if "description" in data:
        updates["description"] = data["description"].strip()
    if "status" in data and data["status"] in ["active", "inactive"]:
        updates["status"] = data["status"]

    if updates:
        db.departments.update_one({"_id": d_oid}, {"$set": updates})
        log_audit(to_object_id(admin_id), "UPDATE_DEPARTMENT", "department", d_oid, updates)

    updated = db.departments.find_one({"_id": d_oid})
    return jsonify({"message": "Department updated.", "department": serialize_doc(updated)}), 200

# Audit Logs
@admin_bp.route("/audit-logs", methods=["GET"])
@role_required("admin")
def get_audit_logs():
    db = get_db()
    action = request.args.get("action")
    resource_type = request.args.get("resource_type")
    limit = int(request.args.get("limit", 100))

    query = {}
    if action:
        query["action"] = action
    if resource_type:
        query["resource_type"] = resource_type

    logs = list(db.audit_logs.find(query).sort("timestamp", -1).limit(limit))

    # Enrich with actor names
    actor_ids = [l["actor_user_id"] for l in logs if l.get("actor_user_id")]
    actors = {str(u["_id"]): u.get("full_name") for u in db.users.find({"_id": {"$in": actor_ids}})}

    enriched = []
    for l in logs:
        l_doc = serialize_doc(l)
        aid = str(l.get("actor_user_id")) if l.get("actor_user_id") else None
        l_doc["actor_name"] = actors.get(aid, "System" if not aid else "Unknown User")
        enriched.append(l_doc)

    return jsonify({"audit_logs": enriched}), 200

# System Settings
@admin_bp.route("/settings", methods=["GET"])
@role_required("admin")
def get_settings():
    db = get_db()
    settings = db.system_settings.find_one({"key": "global_config"})
    if not settings:
        settings = {
            "key": "global_config",
            "hospital_name": "Apex Medicare Center",
            "support_email": "support@smarthealthcare.com",
            "support_phone": "+1 (800) 555-CARE",
            "max_booking_days_ahead": 30,
            "maintenance_mode": False
        }
    return jsonify({"settings": serialize_doc(settings)}), 200

@admin_bp.route("/settings", methods=["PUT"])
@role_required("admin")
def update_settings():
    admin_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}

    updates = {
        "hospital_name": data.get("hospital_name", "Apex Medicare Center"),
        "support_email": data.get("support_email", "support@smarthealthcare.com"),
        "support_phone": data.get("support_phone", "+1 (800) 555-CARE"),
        "max_booking_days_ahead": int(data.get("max_booking_days_ahead", 30)),
        "maintenance_mode": bool(data.get("maintenance_mode", False)),
        "updated_at": datetime.now(timezone.utc)
    }

    db.system_settings.update_one({"key": "global_config"}, {"$set": updates}, upsert=True)
    log_audit(to_object_id(admin_id), "UPDATE_SYSTEM_SETTINGS", "settings", None, updates)

    return jsonify({"message": "Settings updated successfully.", "settings": updates}), 200
