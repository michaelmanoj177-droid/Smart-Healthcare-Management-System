from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.db import get_db
from backend.utils.serializers import serialize_doc, serialize_docs, to_object_id
from backend.utils.auth_helpers import role_required
from backend.utils.audit import log_audit, create_notification

prescriptions_bp = Blueprint("prescriptions", __name__, url_prefix="/api/prescriptions")

def enrich_prescription(rx, db):
    if not rx:
        return None
    data = serialize_doc(rx)

    patient_id = rx.get("patient_id")
    if patient_id:
        p_user = db.users.find_one({"_id": to_object_id(patient_id)})
        if p_user:
            data["patient_name"] = p_user.get("full_name")
            data["patient_email"] = p_user.get("email")
            data["patient_phone"] = p_user.get("phone")
        p_prof = db.patient_profiles.find_one({"user_id": to_object_id(patient_id)})
        if p_prof:
            data["patient_gender"] = p_prof.get("gender")
            data["patient_dob"] = p_prof.get("date_of_birth")

    doctor_id = rx.get("doctor_id")
    if doctor_id:
        d_user = db.users.find_one({"_id": to_object_id(doctor_id)})
        if d_user:
            data["doctor_name"] = d_user.get("full_name")
            data["doctor_email"] = d_user.get("email")
        d_prof = db.doctor_profiles.find_one({"user_id": to_object_id(doctor_id)})
        if d_prof:
            data["doctor_specialization"] = d_prof.get("specialization")
            data["doctor_qualifications"] = d_prof.get("qualifications")
            data["professional_registration_number"] = d_prof.get("professional_registration_number")
            if d_prof.get("department_id"):
                dept = db.departments.find_one({"_id": d_prof["department_id"]})
                if dept:
                    data["department_name"] = dept.get("name")

    return data

@prescriptions_bp.route("", methods=["POST"])
@role_required("doctor")
def create_prescription():
    doctor_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}

    patient_id = data.get("patient_id")
    appointment_id = data.get("appointment_id")
    medicines = data.get("medicines", [])
    instructions = data.get("instructions", "").strip()
    issue_date = data.get("issue_date") or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    follow_up_date = data.get("follow_up_date", "")

    if not patient_id:
        return jsonify({"error": "Bad Request", "message": "Patient ID is required."}), 400

    if not medicines or not isinstance(medicines, list):
        return jsonify({"error": "Bad Request", "message": "At least one medicine item is required."}), 400

    p_oid = to_object_id(patient_id)
    d_oid = to_object_id(doctor_id)
    a_oid = to_object_id(appointment_id) if appointment_id else None

    # Check patient exists
    patient = db.users.find_one({"_id": p_oid, "role": "patient"})
    if not patient:
        return jsonify({"error": "Not Found", "message": "Patient not found."}), 404

    now = datetime.now(timezone.utc)
    rx_doc = {
        "patient_id": p_oid,
        "doctor_id": d_oid,
        "appointment_id": a_oid,
        "medicines": medicines,
        "instructions": instructions,
        "issue_date": issue_date,
        "follow_up_date": follow_up_date,
        "created_at": now
    }

    res = db.prescriptions.insert_one(rx_doc)
    rx_id = res.inserted_id

    doc_user = db.users.find_one({"_id": d_oid})
    doc_name = doc_user.get("full_name") if doc_user else "Doctor"

    create_notification(
        p_oid,
        "New Digital Prescription Issued 💊",
        f"Dr. {doc_name} issued a digital prescription for you. You can review or print it from your dashboard.",
        "prescription"
    )

    log_audit(d_oid, "CREATE_PRESCRIPTION", "prescription", rx_id, {
        "patient_id": str(p_oid),
        "medicine_count": len(medicines)
    })

    return jsonify({
        "message": "Prescription generated successfully.",
        "prescription": enrich_prescription(rx_doc, db)
    }), 201

@prescriptions_bp.route("/patient/me", methods=["GET"])
@role_required("patient")
def get_my_prescriptions():
    user_id = get_jwt_identity()
    db = get_db()
    p_oid = to_object_id(user_id)
    prescriptions = list(db.prescriptions.find({"patient_id": p_oid}).sort("created_at", -1))
    return jsonify({"prescriptions": [enrich_prescription(p, db) for p in prescriptions]}), 200

@prescriptions_bp.route("/doctor/me", methods=["GET"])
@role_required("doctor")
def get_doctor_prescriptions():
    user_id = get_jwt_identity()
    db = get_db()
    d_oid = to_object_id(user_id)
    prescriptions = list(db.prescriptions.find({"doctor_id": d_oid}).sort("created_at", -1))
    return jsonify({"prescriptions": [enrich_prescription(p, db) for p in prescriptions]}), 200

@prescriptions_bp.route("/<prescription_id>", methods=["GET"])
@jwt_required()
def get_prescription_by_id(prescription_id):
    user_id = get_jwt_identity()
    db = get_db()
    rx_oid = to_object_id(prescription_id)
    rx = db.prescriptions.find_one({"_id": rx_oid})

    if not rx:
        return jsonify({"error": "Not Found", "message": "Prescription not found."}), 404

    user = db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if user.get("role") == "patient" and str(rx.get("patient_id")) != user_id:
        return jsonify({"error": "Forbidden", "message": "Access denied."}), 403

    return jsonify({"prescription": enrich_prescription(rx, db)}), 200
