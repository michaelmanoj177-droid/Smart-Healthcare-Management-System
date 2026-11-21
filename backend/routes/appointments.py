from datetime import datetime, date, timezone
from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.db import get_db
from backend.utils.serializers import serialize_doc, serialize_docs, to_object_id
from backend.utils.auth_helpers import role_required
from backend.utils.audit import log_audit, create_notification

appointments_bp = Blueprint("appointments", __name__, url_prefix="/api/appointments")

def enrich_appointment(appt, db):
    """Enrich appointment document with patient, doctor, and department names."""
    if not appt:
        return None
    appt_data = serialize_doc(appt)
    
    # Patient info
    patient_id = appt.get("patient_id")
    if patient_id:
        p_user = db.users.find_one({"_id": to_object_id(patient_id)})
        if p_user:
            appt_data["patient_name"] = p_user.get("full_name")
            appt_data["patient_email"] = p_user.get("email")
            appt_data["patient_phone"] = p_user.get("phone")
        p_prof = db.patient_profiles.find_one({"user_id": to_object_id(patient_id)})
        if p_prof:
            appt_data["patient_gender"] = p_prof.get("gender")
            appt_data["patient_dob"] = p_prof.get("date_of_birth")
            appt_data["patient_blood_group"] = p_prof.get("blood_group")

    # Doctor info
    doctor_id = appt.get("doctor_id")
    if doctor_id:
        d_user = db.users.find_one({"_id": to_object_id(doctor_id)})
        if d_user:
            appt_data["doctor_name"] = d_user.get("full_name")
            appt_data["doctor_email"] = d_user.get("email")
            appt_data["doctor_phone"] = d_user.get("phone")
        d_prof = db.doctor_profiles.find_one({"user_id": to_object_id(doctor_id)})
        if d_prof:
            appt_data["doctor_specialization"] = d_prof.get("specialization")
            appt_data["consultation_fee"] = d_prof.get("consultation_fee")
            if d_prof.get("department_id"):
                dept = db.departments.find_one({"_id": d_prof["department_id"]})
                if dept:
                    appt_data["department_name"] = dept.get("name")

    return appt_data

@appointments_bp.route("/book", methods=["POST"])
@role_required("patient")
def book_appointment():
    user_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}

    doctor_id = data.get("doctor_id")
    appointment_date = data.get("appointment_date") # YYYY-MM-DD
    start_time = data.get("start_time") # HH:MM
    end_time = data.get("end_time") # HH:MM
    reason = data.get("reason", "").strip()

    if not doctor_id or not appointment_date or not start_time:
        return jsonify({"error": "Bad Request", "message": "Doctor, appointment date, and time slot are required."}), 400

    d_oid = to_object_id(doctor_id)
    p_oid = to_object_id(user_id)

    # Validate date is not in past
    try:
        req_date = datetime.strptime(appointment_date, "%Y-%m-%d").date()
        if req_date < date.today():
            return jsonify({"error": "Bad Request", "message": "Appointment date cannot be in the past."}), 400
    except ValueError:
        return jsonify({"error": "Bad Request", "message": "Invalid date format. Use YYYY-MM-DD."}), 400

    # Validate Doctor exists and is verified
    doctor = db.users.find_one({"_id": d_oid, "role": "doctor", "account_status": "active"})
    doc_profile = db.doctor_profiles.find_one({"user_id": d_oid, "verification_status": "verified"})
    if not doctor or not doc_profile:
        return jsonify({"error": "Bad Request", "message": "Selected doctor is not available for bookings."}), 400

    # Overlap and double booking check
    conflict = db.appointments.find_one({
        "doctor_id": d_oid,
        "appointment_date": appointment_date,
        "start_time": start_time,
        "status": {"$in": ["pending", "confirmed"]}
    })
    if conflict:
        return jsonify({"error": "Conflict", "message": "This time slot is no longer available. Please select another slot."}), 409

    # Patient conflict check (cannot double book self at same time)
    patient_conflict = db.appointments.find_one({
        "patient_id": p_oid,
        "appointment_date": appointment_date,
        "start_time": start_time,
        "status": {"$in": ["pending", "confirmed"]}
    })
    if patient_conflict:
        return jsonify({"error": "Conflict", "message": "You already have an appointment scheduled for this time."}), 409

    now = datetime.now(timezone.utc)
    appt_doc = {
        "patient_id": p_oid,
        "doctor_id": d_oid,
        "appointment_date": appointment_date,
        "start_time": start_time,
        "end_time": end_time or start_time,
        "reason": reason or "General consultation",
        "status": "pending",
        "created_at": now,
        "updated_at": now
    }

    res = db.appointments.insert_one(appt_doc)
    appt_id = res.inserted_id

    # Create notifications
    patient_user = db.users.find_one({"_id": p_oid})
    patient_name = patient_user.get("full_name", "A patient")
    doctor_name = doctor.get("full_name", "Doctor")

    create_notification(
        p_oid,
        "Appointment Requested",
        f"Your appointment with {doctor_name} on {appointment_date} at {start_time} has been requested and is awaiting confirmation.",
        "appointment"
    )
    create_notification(
        d_oid,
        "New Appointment Booking",
        f"{patient_name} requested an appointment on {appointment_date} at {start_time}. Reason: {reason or 'General consultation'}",
        "appointment"
    )

    log_audit(p_oid, "APPOINTMENT_BOOK", "appointment", appt_id, {
        "doctor_id": str(d_oid),
        "date": appointment_date,
        "time": start_time
    })

    return jsonify({
        "message": "Appointment booked successfully.",
        "appointment": enrich_appointment(appt_doc, db)
    }), 201

@appointments_bp.route("/my-appointments", methods=["GET"])
@role_required("patient")
def get_patient_appointments():
    user_id = get_jwt_identity()
    db = get_db()
    status_filter = request.args.get("status")
    
    query = {"patient_id": to_object_id(user_id)}
    if status_filter:
        query["status"] = status_filter

    appts = list(db.appointments.find(query).sort([("appointment_date", -1), ("start_time", -1)]))
    enriched = [enrich_appointment(a, db) for a in appts]
    return jsonify({"appointments": enriched}), 200

@appointments_bp.route("/doctor-appointments", methods=["GET"])
@role_required("doctor")
def get_doctor_appointments():
    user_id = get_jwt_identity()
    db = get_db()
    status_filter = request.args.get("status")
    date_filter = request.args.get("date")

    query = {"doctor_id": to_object_id(user_id)}
    if status_filter:
        query["status"] = status_filter
    if date_filter:
        query["appointment_date"] = date_filter

    appts = list(db.appointments.find(query).sort([("appointment_date", 1), ("start_time", 1)]))
    enriched = [enrich_appointment(a, db) for a in appts]
    return jsonify({"appointments": enriched}), 200

@appointments_bp.route("/<appointment_id>", methods=["GET"])
@jwt_required()
def get_appointment_details(appointment_id):
    user_id = get_jwt_identity()
    db = get_db()
    a_oid = to_object_id(appointment_id)
    appt = db.appointments.find_one({"_id": a_oid})
    if not appt:
        return jsonify({"error": "Not Found", "message": "Appointment not found."}), 404

    # Security check: User must be the patient, doctor, or an admin
    user = db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if user.get("role") != "admin":
        if str(appt.get("patient_id")) != user_id and str(appt.get("doctor_id")) != user_id:
            return jsonify({"error": "Forbidden", "message": "You are not authorized to view this appointment."}), 403

    return jsonify({"appointment": enrich_appointment(appt, db)}), 200

@appointments_bp.route("/<appointment_id>/status", methods=["PUT"])
@jwt_required()
def update_appointment_status(appointment_id):
    user_id = get_jwt_identity()
    db = get_db()
    a_oid = to_object_id(appointment_id)
    appt = db.appointments.find_one({"_id": a_oid})
    if not appt:
        return jsonify({"error": "Not Found", "message": "Appointment not found."}), 404

    user = db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}
    new_status = data.get("status")
    notes = data.get("notes", "")

    valid_statuses = ["pending", "confirmed", "completed", "cancelled", "rejected"]
    if new_status not in valid_statuses:
        return jsonify({"error": "Bad Request", "message": f"Invalid status: {new_status}"}), 400

    user_role = user.get("role")
    is_patient = str(appt.get("patient_id")) == user_id
    is_doctor = str(appt.get("doctor_id")) == user_id
    is_admin = user_role == "admin"

    # Permission matrix:
    # Patient: can only cancel pending/confirmed
    # Doctor: can confirm/reject pending; mark confirmed as completed; cancel
    # Admin: full management
    if is_patient:
        if new_status != "cancelled":
            return jsonify({"error": "Forbidden", "message": "Patients can only cancel appointments."}), 403
        if appt.get("status") in ["completed", "cancelled", "rejected"]:
            return jsonify({"error": "Bad Request", "message": "This appointment can no longer be cancelled."}), 400
    elif is_doctor:
        if new_status not in ["confirmed", "rejected", "completed", "cancelled"]:
            return jsonify({"error": "Forbidden", "message": "Invalid status transition for doctor."}), 403
    elif not is_admin:
        return jsonify({"error": "Forbidden", "message": "Unauthorized to update this appointment."}), 403

    now = datetime.now(timezone.utc)
    db.appointments.update_one(
        {"_id": a_oid},
        {"$set": {
            "status": new_status,
            "status_notes": notes,
            "updated_at": now
        }}
    )

    # Notifications
    doc_user = db.users.find_one({"_id": appt["doctor_id"]})
    doctor_name = doc_user.get("full_name") if doc_user else "Doctor"

    if new_status == "confirmed":
        create_notification(
            appt["patient_id"],
            "Appointment Confirmed! ✅",
            f"Dr. {doctor_name} has confirmed your appointment on {appt['appointment_date']} at {appt['start_time']}.",
            "appointment"
        )
    elif new_status == "rejected":
        create_notification(
            appt["patient_id"],
            "Appointment Update",
            f"Your appointment request for {appt['appointment_date']} could not be accommodated by Dr. {doctor_name}.",
            "appointment"
        )
    elif new_status == "cancelled":
        cancelled_by = "You" if is_patient else f"Dr. {doctor_name}"
        create_notification(
            appt["doctor_id"] if is_patient else appt["patient_id"],
            "Appointment Cancelled",
            f"The appointment on {appt['appointment_date']} at {appt['start_time']} was cancelled.",
            "appointment"
        )
    elif new_status == "completed":
        create_notification(
            appt["patient_id"],
            "Consultation Completed",
            f"Your consultation with Dr. {doctor_name} has been marked completed. You can view your medical notes and prescriptions in your dashboard.",
            "appointment"
        )

    log_audit(user["_id"], "APPOINTMENT_STATUS_UPDATE", "appointment", a_oid, {
        "old_status": appt.get("status"),
        "new_status": new_status,
        "notes": notes
    })

    updated_appt = db.appointments.find_one({"_id": a_oid})
    return jsonify({
        "message": f"Appointment status updated to {new_status}.",
        "appointment": enrich_appointment(updated_appt, db)
    }), 200
