from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.db import get_db
from backend.utils.serializers import serialize_doc, serialize_docs, to_object_id
from backend.utils.auth_helpers import role_required
from backend.utils.audit import log_audit, create_notification

records_bp = Blueprint("records", __name__, url_prefix="/api/records")

def enrich_record(rec, db):
    if not rec:
        return None
    r_data = serialize_doc(rec)

    patient_id = rec.get("patient_id")
    if patient_id:
        p_user = db.users.find_one({"_id": to_object_id(patient_id)})
        if p_user:
            r_data["patient_name"] = p_user.get("full_name")
            r_data["patient_email"] = p_user.get("email")

    doctor_id = rec.get("doctor_id")
    if doctor_id:
        d_user = db.users.find_one({"_id": to_object_id(doctor_id)})
        if d_user:
            r_data["doctor_name"] = d_user.get("full_name")
        d_prof = db.doctor_profiles.find_one({"user_id": to_object_id(doctor_id)})
        if d_prof:
            r_data["doctor_specialization"] = d_prof.get("specialization")

    return r_data

@records_bp.route("", methods=["POST"])
@role_required("doctor")
def create_medical_record():
    doctor_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}

    patient_id = data.get("patient_id")
    appointment_id = data.get("appointment_id")
    consultation_date = data.get("consultation_date") or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    symptoms = data.get("symptoms", "").strip()
    clinical_notes = data.get("clinical_notes", "").strip()
    diagnosis = data.get("diagnosis", "").strip()
    allergies = data.get("allergies", "").strip()
    follow_up_date = data.get("follow_up_date", "")

    if not patient_id:
        return jsonify({"error": "Bad Request", "message": "Patient ID is required."}), 400

    p_oid = to_object_id(patient_id)
    d_oid = to_object_id(doctor_id)
    a_oid = to_object_id(appointment_id) if appointment_id else None

    # Check patient exists
    patient = db.users.find_one({"_id": p_oid, "role": "patient"})
    if not patient:
        return jsonify({"error": "Not Found", "message": "Patient not found."}), 404

    now = datetime.now(timezone.utc)
    record_doc = {
        "patient_id": p_oid,
        "doctor_id": d_oid,
        "appointment_id": a_oid,
        "consultation_date": consultation_date,
        "symptoms": symptoms,
        "clinical_notes": clinical_notes,
        "diagnosis": diagnosis,
        "allergies": allergies,
        "follow_up_date": follow_up_date,
        "created_at": now,
        "updated_at": now
    }

    res = db.medical_records.insert_one(record_doc)
    rec_id = res.inserted_id

    # If linked to appointment, optionally update status to completed if appropriate
    if a_oid:
        db.appointments.update_one(
            {"_id": a_oid, "doctor_id": d_oid},
            {"$set": {"status": "completed", "updated_at": now}}
        )

    # Notify patient
    doc_user = db.users.find_one({"_id": d_oid})
    doc_name = doc_user.get("full_name") if doc_user else "Your Doctor"
    create_notification(
        p_oid,
        "New Medical Record Added",
        f"Dr. {doc_name} has published a consultation note and diagnosis for your record.",
        "record"
    )

    log_audit(d_oid, "CREATE_MEDICAL_RECORD", "medical_record", rec_id, {
        "patient_id": str(p_oid),
        "diagnosis": diagnosis
    })

    return jsonify({
        "message": "Medical record created successfully.",
        "record": enrich_record(record_doc, db)
    }), 201

@records_bp.route("/patient/me", methods=["GET"])
@role_required("patient")
def get_my_medical_records():
    user_id = get_jwt_identity()
    db = get_db()
    p_oid = to_object_id(user_id)
    date_filter = request.args.get("date")

    query = {"patient_id": p_oid}
    if date_filter:
        query["consultation_date"] = date_filter

    records = list(db.medical_records.find(query).sort("created_at", -1))
    return jsonify({"records": [enrich_record(r, db) for r in records]}), 200

@records_bp.route("/patient/<patient_id>", methods=["GET"])
@role_required("doctor")
def get_patient_records_for_doctor(patient_id):
    """Doctor retrieves historical records for a specific patient under care."""
    doctor_id = get_jwt_identity()
    db = get_db()
    p_oid = to_object_id(patient_id)

    # Verify patient exists
    patient = db.users.find_one({"_id": p_oid, "role": "patient"})
    if not patient:
        return jsonify({"error": "Not Found", "message": "Patient not found."}), 404

    records = list(db.medical_records.find({"patient_id": p_oid}).sort("created_at", -1))
    
    log_audit(to_object_id(doctor_id), "VIEW_PATIENT_RECORDS", "medical_record", None, {
        "target_patient_id": str(p_oid)
    })

    return jsonify({
        "patient": {
            "id": str(patient["_id"]),
            "full_name": patient.get("full_name"),
            "email": patient.get("email"),
            "phone": patient.get("phone")
        },
        "records": [enrich_record(r, db) for r in records]
    }), 200

@records_bp.route("/<record_id>", methods=["GET"])
@jwt_required()
def get_single_record(record_id):
    user_id = get_jwt_identity()
    db = get_db()
    r_oid = to_object_id(record_id)
    record = db.medical_records.find_one({"_id": r_oid})

    if not record:
        return jsonify({"error": "Not Found", "message": "Record not found."}), 404

    user = db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    # Privacy: Patient can only view their own; Doctor can view their created records or patients under care
    if user.get("role") == "patient" and str(record.get("patient_id")) != user_id:
        return jsonify({"error": "Forbidden", "message": "Access denied to this clinical record."}), 403

    return jsonify({"record": enrich_record(record, db)}), 200
