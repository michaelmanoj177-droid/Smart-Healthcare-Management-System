from datetime import datetime, date, timedelta, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.db import get_db
from backend.utils.serializers import serialize_doc, serialize_docs, to_object_id
from backend.utils.auth_helpers import role_required

doctors_bp = Blueprint("doctors", __name__, url_prefix="/api")

@doctors_bp.route("/departments", methods=["GET"])
def get_departments():
    db = get_db()
    departments = list(db.departments.find({"status": "active"}))
    return jsonify({"departments": serialize_docs(departments)}), 200

@doctors_bp.route("/doctors", methods=["GET"])
def get_doctors():
    db = get_db()
    query_search = request.args.get("search", "").strip()
    specialization = request.args.get("specialization", "").strip()
    department_id = request.args.get("department_id", "").strip()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 12))

    # Match verified doctor profiles
    profile_filter = {"verification_status": "verified"}
    if specialization:
        profile_filter["specialization"] = {"$regex": specialization, "$options": "i"}
    if department_id:
        dept_oid = to_object_id(department_id)
        if dept_oid:
            profile_filter["department_id"] = dept_oid

    profiles = list(db.doctor_profiles.find(profile_filter))
    if not profiles:
        return jsonify({"doctors": [], "total": 0, "page": page, "total_pages": 0}), 200

    doctor_user_ids = [p["user_id"] for p in profiles]
    user_filter = {
        "_id": {"$in": doctor_user_ids},
        "account_status": "active"
    }

    if query_search:
        user_filter["full_name"] = {"$regex": query_search, "$options": "i"}

    users = {str(u["_id"]): u for u in db.users.find(user_filter)}

    # Fetch departments map
    departments = {str(d["_id"]): d["name"] for d in db.departments.find({})}

    doctor_list = []
    for p in profiles:
        uid_str = str(p["user_id"])
        if uid_str in users:
            u = users[uid_str]
            dept_name = departments.get(str(p.get("department_id")), "General")
            doctor_list.append({
                "id": uid_str,
                "doctor_profile_id": str(p["_id"]),
                "name": u.get("full_name"),
                "email": u.get("email"),
                "phone": u.get("phone"),
                "specialization": p.get("specialization"),
                "qualifications": p.get("qualifications"),
                "experience_years": p.get("experience_years"),
                "consultation_fee": p.get("consultation_fee"),
                "biography": p.get("biography"),
                "profile_image": p.get("profile_image"),
                "verification_status": p.get("verification_status"),
                "department_id": str(p.get("department_id")) if p.get("department_id") else None,
                "department_name": dept_name
            })

    total = len(doctor_list)
    start = (page - 1) * limit
    paginated = doctor_list[start:start + limit]
    total_pages = (total + limit - 1) // limit

    return jsonify({
        "doctors": paginated,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }), 200

@doctors_bp.route("/doctors/<doctor_id>", methods=["GET"])
def get_doctor_details(doctor_id):
    db = get_db()
    d_oid = to_object_id(doctor_id)
    user = db.users.find_one({"_id": d_oid, "role": "doctor"})
    if not user:
        return jsonify({"error": "Not Found", "message": "Doctor not found."}), 404

    profile = db.doctor_profiles.find_one({"user_id": d_oid})
    if not profile:
        return jsonify({"error": "Not Found", "message": "Doctor profile not found."}), 404

    dept_name = "General"
    if profile.get("department_id"):
        dept = db.departments.find_one({"_id": profile["department_id"]})
        if dept:
            dept_name = dept.get("name")

    # Fetch availability schedule
    availability = list(db.doctor_availability.find({"doctor_id": d_oid}))

    result = {
        "id": str(user["_id"]),
        "name": user.get("full_name"),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "specialization": profile.get("specialization"),
        "qualifications": profile.get("qualifications"),
        "experience_years": profile.get("experience_years"),
        "professional_registration_number": profile.get("professional_registration_number"),
        "consultation_fee": profile.get("consultation_fee"),
        "biography": profile.get("biography"),
        "profile_image": profile.get("profile_image"),
        "verification_status": profile.get("verification_status"),
        "department_id": str(profile.get("department_id")) if profile.get("department_id") else None,
        "department_name": dept_name,
        "availability_schedule": serialize_docs(availability)
    }

    return jsonify({"doctor": result}), 200

@doctors_bp.route("/doctors/<doctor_id>/availability", methods=["GET"])
def get_doctor_slots(doctor_id):
    db = get_db()
    d_oid = to_object_id(doctor_id)
    date_str = request.args.get("date") # "YYYY-MM-DD"

    if not date_str:
        return jsonify({"error": "Bad Request", "message": "Date parameter (YYYY-MM-DD) is required."}), 400

    try:
        req_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Bad Request", "message": "Invalid date format. Use YYYY-MM-DD."}), 400

    day_name = req_date.strftime("%A")

    # Check doctor availability for this day of week
    schedule = db.doctor_availability.find_one({
        "doctor_id": d_oid,
        "day_of_week": day_name,
        "is_available": True
    })

    if not schedule:
        return jsonify({
            "date": date_str,
            "day": day_name,
            "slots": [],
            "message": f"Doctor is not available on {day_name}s."
        }), 200

    # Generate time slots
    start_time_str = schedule.get("start_time", "09:00")
    end_time_str = schedule.get("end_time", "17:00")
    duration = schedule.get("slot_duration_minutes", 30)

    try:
        cur_time = datetime.strptime(start_time_str, "%H:%M")
        end_time = datetime.strptime(end_time_str, "%H:%M")
    except ValueError:
        cur_time = datetime.strptime("09:00", "%H:%M")
        end_time = datetime.strptime("17:00", "%H:%M")

    # Find booked appointments for this doctor on this date
    booked_appointments = list(db.appointments.find({
        "doctor_id": d_oid,
        "appointment_date": date_str,
        "status": {"$in": ["pending", "confirmed"]}
    }))
    booked_times = {a["start_time"] for a in booked_appointments}

    slots = []
    while cur_time + timedelta(minutes=duration) <= end_time:
        slot_start = cur_time.strftime("%H:%M")
        slot_end = (cur_time + timedelta(minutes=duration)).strftime("%H:%M")
        
        is_booked = slot_start in booked_times
        slots.append({
            "start_time": slot_start,
            "end_time": slot_end,
            "available": not is_booked
        })
        cur_time += timedelta(minutes=duration)

    return jsonify({
        "date": date_str,
        "day": day_name,
        "slots": slots
    }), 200

@doctors_bp.route("/doctor/availability", methods=["GET"])
@role_required("doctor")
def get_my_availability():
    user_id = get_jwt_identity()
    db = get_db()
    d_oid = to_object_id(user_id)
    schedules = list(db.doctor_availability.find({"doctor_id": d_oid}))
    return jsonify({"schedules": serialize_docs(schedules)}), 200

@doctors_bp.route("/doctor/availability", methods=["PUT"])
@role_required("doctor")
def update_my_availability():
    user_id = get_jwt_identity()
    db = get_db()
    d_oid = to_object_id(user_id)
    data = request.get_json() or {}
    schedules = data.get("schedules", [])

    if not isinstance(schedules, list):
        return jsonify({"error": "Bad Request", "message": "Expected a list of daily schedules."}), 400

    for item in schedules:
        day = item.get("day_of_week")
        if not day:
            continue
        db.doctor_availability.update_one(
            {"doctor_id": d_oid, "day_of_week": day},
            {"$set": {
                "doctor_id": d_oid,
                "day_of_week": day,
                "start_time": item.get("start_time", "09:00"),
                "end_time": item.get("end_time", "17:00"),
                "slot_duration_minutes": int(item.get("slot_duration_minutes", 30)),
                "is_available": bool(item.get("is_available", True))
            }},
            upsert=True
        )

    return jsonify({"message": "Availability schedule updated successfully."}), 200
