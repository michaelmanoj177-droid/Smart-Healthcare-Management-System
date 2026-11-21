from datetime import datetime, date, timedelta, timezone
from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.db import get_db
from backend.utils.serializers import serialize_doc, serialize_docs, to_object_id
from backend.utils.auth_helpers import role_required, get_current_user
from backend.utils.audit import log_audit, create_notification
from backend.utils.medicine_data import (
    VERIFIED_MEDICINES,
    DRUG_INTERACTIONS,
    DUPLICATE_ACTIVE_INGREDIENTS,
    ALLERGY_CROSS_MAP
)

medications_bp = Blueprint("medications", __name__, url_prefix="/api/medications")

# ========================================================
# 1. MEDICINE REFERENCE INFORMATION FINDER & BARCODE LOOKUP
# ========================================================

@medications_bp.route("/search", methods=["GET"])
def search_medicines():
    """
    Search verified medicines by generic name, brand name, drug class, or barcode.
    Returns verified clinical monographs with data source and last-updated date.
    Never invents unverified medicine information.
    """
    db = get_db()
    query = request.args.get("q", "").strip().lower()
    barcode = request.args.get("barcode", "").strip()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))

    filter_criteria = {}
    if barcode:
        filter_criteria["barcode"] = barcode
    elif query:
        filter_criteria["$or"] = [
            {"generic_name": {"$regex": query, "$options": "i"}},
            {"brand_name": {"$regex": query, "$options": "i"}},
            {"drug_class": {"$regex": query, "$options": "i"}},
            {"active_ingredients": {"$in": [query]}}
        ]

    medicines = list(db.medicine_reference.find(filter_criteria))

    # If DB collection is empty, search from memory/catalog
    if not medicines and (query or barcode):
        matches = []
        for m in VERIFIED_MEDICINES:
            if barcode and m.get("barcode") == barcode:
                matches.append(m)
            elif query:
                if (query in m.get("generic_name", "").lower() or
                    query in m.get("brand_name", "").lower() or
                    query in m.get("drug_class", "").lower() or
                    any(query in ing.lower() for ing in m.get("active_ingredients", []))):
                    matches.append(m)
        medicines = matches

    total = len(medicines)
    start = (page - 1) * limit
    paginated = medicines[start:start + limit]

    return jsonify({
        "medicines": serialize_docs(paginated),
        "total": total,
        "page": page,
        "limit": limit,
        "source": "U.S. National Library of Medicine (DailyMed) & Verified Clinical Compendium",
        "verified_catalog_available": True
    }), 200

@medications_bp.route("/reference/<id_or_barcode>", methods=["GET"])
def get_medicine_reference(id_or_barcode):
    """Retrieve detailed monograph for a specific verified drug."""
    db = get_db()
    oid = to_object_id(id_or_barcode)
    
    med = None
    if oid:
        med = db.medicine_reference.find_one({"_id": oid})
    if not med:
        med = db.medicine_reference.find_one({"barcode": id_or_barcode})
    if not med:
        for m in VERIFIED_MEDICINES:
            if m.get("barcode") == id_or_barcode or id_or_barcode.lower() in m.get("brand_name", "").lower() or id_or_barcode.lower() in m.get("generic_name", "").lower():
                med = m
                break

    if not med:
        return jsonify({
            "error": "Not Found",
            "message": "Verified medication monograph is unavailable for this identifier. Information cannot be inferred or invented without verified scientific data source.",
            "is_available": False
        }), 404

    return jsonify({
        "medicine": serialize_doc(med),
        "is_available": True
    }), 200

# ========================================================
# 2. MEDICATION SCHEDULES & REMINDERS
# ========================================================

@medications_bp.route("/schedules", methods=["GET"])
@jwt_required()
def get_schedules():
    """
    Retrieve medication schedules. Patients see only their own schedules.
    Doctors can see a specific patient's schedules if patient_id is passed.
    """
    user_id = get_jwt_identity()
    db = get_db()
    user = db.users.find_one({"_id": to_object_id(user_id)})
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    patient_oid = to_object_id(user_id)
    if user.get("role") in ["doctor", "admin"]:
        param_pid = request.args.get("patient_id")
        if param_pid:
            patient_oid = to_object_id(param_pid)

    schedules = list(db.medication_schedules.find({
        "patient_id": patient_oid,
        "is_active": True
    }).sort("created_at", -1))

    # Enrich with doctor name if available
    enriched = []
    for s in schedules:
        s_data = serialize_doc(s)
        if s.get("doctor_id"):
            doc_user = db.users.find_one({"_id": to_object_id(s["doctor_id"])})
            if doc_user:
                s_data["doctor_name"] = doc_user.get("full_name")
                s_data["doctor_phone"] = doc_user.get("phone")
        enriched.append(s_data)

    return jsonify({"schedules": enriched}), 200

@medications_bp.route("/schedules", methods=["POST"])
@jwt_required()
def create_schedule():
    """Record a doctor-approved medication schedule."""
    user_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}

    medicine_name = data.get("medicine_name", "").strip()
    dosage = data.get("dosage", "").strip()
    frequency = data.get("frequency", "Once Daily").strip()
    start_date = data.get("start_date") or date.today().isoformat()
    end_date = data.get("end_date")
    timing_slots = data.get("timing_slots", ["Morning"])
    instructions = data.get("instructions", "").strip()
    prescription_id = data.get("prescription_id")
    doctor_id = data.get("doctor_id")

    if not medicine_name or not dosage:
        return jsonify({"error": "Bad Request", "message": "Medicine name and prescribed dose are required."}), 400

    now = datetime.now(timezone.utc)
    schedule_doc = {
        "patient_id": to_object_id(user_id),
        "prescription_id": to_object_id(prescription_id) if prescription_id else None,
        "doctor_id": to_object_id(doctor_id) if doctor_id else None,
        "medicine_name": medicine_name,
        "dosage": dosage,
        "frequency": frequency,
        "timing_slots": timing_slots if isinstance(timing_slots, list) else [timing_slots],
        "start_date": start_date,
        "end_date": end_date,
        "instructions": instructions,
        "reminder_enabled": bool(data.get("reminder_enabled", True)),
        "is_active": True,
        "missed_dose_guidance": "If you miss a dose, take it as soon as remembered unless it is almost time for your next scheduled dose. Never take extra or double doses to compensate for a missed dose.",
        "created_at": now,
        "updated_at": now
    }

    res = db.medication_schedules.insert_one(schedule_doc)
    sched_id = res.inserted_id

    log_audit(user_id, "CREATE_MEDICATION_SCHEDULE", "medication_schedule", sched_id, {
        "medicine_name": medicine_name,
        "dosage": dosage
    })

    return jsonify({
        "message": "Medication schedule created successfully.",
        "schedule": serialize_doc(schedule_doc)
    }), 201

@medications_bp.route("/schedules/<schedule_id>", methods=["PUT"])
@jwt_required()
def update_schedule(schedule_id):
    """Update timing or reminders for a patient's schedule. Prevents patients from altering doctor's prescribed dosage."""
    user_id = get_jwt_identity()
    db = get_db()
    s_oid = to_object_id(schedule_id)
    sched = db.medication_schedules.find_one({"_id": s_oid})

    if not sched:
        return jsonify({"error": "Not Found", "message": "Medication schedule not found."}), 404

    user = db.users.find_one({"_id": to_object_id(user_id)})
    is_patient = str(sched.get("patient_id")) == user_id
    is_doctor = user.get("role") == "doctor"
    is_admin = user.get("role") == "admin"

    if not (is_patient or is_doctor or is_admin):
        return jsonify({"error": "Forbidden", "message": "Unauthorized access to schedule."}), 403

    data = request.get_json() or {}
    now = datetime.now(timezone.utc)
    updates = {"updated_at": now}

    # If linked to a digital prescription and user is patient, do NOT allow changing dosage or medicine name
    if sched.get("prescription_id") and is_patient:
        if "dosage" in data and data["dosage"] != sched.get("dosage"):
            return jsonify({
                "error": "Forbidden",
                "message": "Prescription dosage is locked to doctor's clinical order and cannot be modified by the patient. Contact your physician for dosage changes."
            }), 403

    if "timing_slots" in data:
        updates["timing_slots"] = data["timing_slots"]
    if "reminder_enabled" in data:
        updates["reminder_enabled"] = bool(data["reminder_enabled"])
    if "instructions" in data:
        updates["instructions"] = data["instructions"]
    if is_doctor or not sched.get("prescription_id"):
        if "dosage" in data:
            updates["dosage"] = data["dosage"]
        if "frequency" in data:
            updates["frequency"] = data["frequency"]

    db.medication_schedules.update_one({"_id": s_oid}, {"$set": updates})
    log_audit(user_id, "UPDATE_MEDICATION_SCHEDULE", "medication_schedule", s_oid, updates)

    updated = db.medication_schedules.find_one({"_id": s_oid})
    return jsonify({
        "message": "Schedule updated successfully.",
        "schedule": serialize_doc(updated)
    }), 200

@medications_bp.route("/schedules/<schedule_id>", methods=["DELETE"])
@jwt_required()
def delete_schedule(schedule_id):
    """Deactivate a medication schedule."""
    user_id = get_jwt_identity()
    db = get_db()
    s_oid = to_object_id(schedule_id)
    sched = db.medication_schedules.find_one({"_id": s_oid, "patient_id": to_object_id(user_id)})
    if not sched:
        return jsonify({"error": "Not Found", "message": "Schedule not found."}), 404

    db.medication_schedules.update_one({"_id": s_oid}, {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}})
    log_audit(user_id, "DEACTIVATE_MEDICATION_SCHEDULE", "medication_schedule", s_oid)
    return jsonify({"message": "Medication schedule archived."}), 200

@medications_bp.route("/schedules/import-from-prescription/<prescription_id>", methods=["POST"])
@jwt_required()
def import_from_prescription(prescription_id):
    """
    Import medicines directly from an authorized digital prescription into the patient's schedule.
    Preserves audit history and locks dosage to doctor's clinical instruction.
    """
    user_id = get_jwt_identity()
    db = get_db()
    rx_oid = to_object_id(prescription_id)
    rx = db.prescriptions.find_one({"_id": rx_oid, "patient_id": to_object_id(user_id)})

    if not rx:
        return jsonify({"error": "Not Found", "message": "Prescription record not found."}), 404

    medicines = rx.get("medicines", [])
    now = datetime.now(timezone.utc)
    imported = []

    for med in medicines:
        # Determine standard timing slots based on frequency
        freq = med.get("frequency", "Once daily").lower()
        if "twice" in freq:
            timing_slots = ["Morning", "Evening"]
        elif "three" in freq:
            timing_slots = ["Morning", "Afternoon", "Evening"]
        elif "night" in freq or "bedtime" in freq:
            timing_slots = ["Bedtime"]
        else:
            timing_slots = ["Morning"]

        schedule_doc = {
            "patient_id": to_object_id(user_id),
            "prescription_id": rx_oid,
            "doctor_id": rx.get("doctor_id"),
            "medicine_name": med.get("name"),
            "dosage": med.get("dosage", "1 Dose"),
            "frequency": med.get("frequency", "Daily"),
            "timing_slots": timing_slots,
            "start_date": rx.get("issue_date") or date.today().isoformat(),
            "end_date": rx.get("follow_up_date"),
            "instructions": med.get("instructions") or rx.get("instructions", "Take as directed by doctor"),
            "reminder_enabled": True,
            "is_active": True,
            "missed_dose_guidance": "If you miss a dose, take it as soon as remembered unless it is almost time for your next scheduled dose. Never take extra or double doses.",
            "created_at": now,
            "updated_at": now
        }
        res = db.medication_schedules.insert_one(schedule_doc)
        imported.append(serialize_doc(schedule_doc))

    log_audit(user_id, "IMPORT_PRESCRIPTION_TO_SCHEDULE", "prescription", rx_oid, {"count": len(imported)})

    return jsonify({
        "message": f"Successfully imported {len(imported)} prescribed medication(s) to your active schedule.",
        "imported_schedules": imported
    }), 201

# ========================================================
# 3. DOSE LOGS & ADHERENCE TRACKING
# ========================================================

@medications_bp.route("/doses", methods=["GET"])
@jwt_required()
def get_doses():
    """
    Get scheduled doses for a specific date (defaults to today).
    Separates into upcoming, completed, and missed doses.
    """
    user_id = get_jwt_identity()
    db = get_db()
    target_date = request.args.get("date", date.today().isoformat())

    p_oid = to_object_id(user_id)
    # Active schedules for patient
    schedules = list(db.medication_schedules.find({
        "patient_id": p_oid,
        "is_active": True
    }))

    # Existing dose logs for this date
    dose_logs = list(db.dose_logs.find({
        "patient_id": p_oid,
        "scheduled_date": target_date
    }))
    log_map = {f"{log['schedule_id']}_{log['scheduled_time']}": log for log in dose_logs}

    upcoming = []
    completed = []
    missed = []

    # Doctors map for contact lookup
    doc_ids = [s["doctor_id"] for s in schedules if s.get("doctor_id")]
    doctors = {str(d["_id"]): d for d in db.users.find({"_id": {"$in": doc_ids}})}

    for s in schedules:
        # Check start and end date
        if s.get("start_date") and s["start_date"] > target_date:
            continue
        if s.get("end_date") and s["end_date"] < target_date:
            continue

        doc_info = doctors.get(str(s.get("doctor_id"))) if s.get("doctor_id") else None

        for slot in s.get("timing_slots", ["Morning"]):
            key = f"{s['_id']}_{slot}"
            log = log_map.get(key)

            dose_item = {
                "schedule_id": str(s["_id"]),
                "medicine_name": s["medicine_name"],
                "dosage": s["dosage"],
                "scheduled_date": target_date,
                "scheduled_time": slot,
                "instructions": s.get("instructions", ""),
                "missed_dose_guidance": s.get("missed_dose_guidance"),
                "doctor_name": doc_info.get("full_name") if doc_info else "Prescribing Physician",
                "doctor_phone": doc_info.get("phone") if doc_info else "+1 (800) 555-CARE",
                "status": log["status"] if log else "pending",
                "taken_at": log["taken_at"].isoformat() if log and log.get("taken_at") else None,
                "log_id": str(log["_id"]) if log else None
            }

            if log and log.get("status") == "taken":
                completed.append(dose_item)
            elif log and log.get("status") in ["missed", "skipped"]:
                missed.append(dose_item)
            else:
                # Check if it should be marked as missed (past date)
                if target_date < date.today().isoformat():
                    dose_item["status"] = "missed"
                    missed.append(dose_item)
                else:
                    upcoming.append(dose_item)

    total_doses = len(completed) + len(upcoming) + len(missed)
    adherence_rate = round((len(completed) / total_doses * 100), 1) if total_doses > 0 else 100.0

    return jsonify({
        "date": target_date,
        "adherence_rate": adherence_rate,
        "upcoming_doses": upcoming,
        "completed_doses": completed,
        "missed_doses": missed,
        "total_scheduled": total_doses
    }), 200

@medications_bp.route("/doses/log", methods=["POST"])
@jwt_required()
def log_dose():
    """
    Log whether a scheduled dose was taken, skipped, or missed.
    Safety rule: Reminds patient never to take double doses for missed doses.
    """
    user_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}

    schedule_id = data.get("schedule_id")
    scheduled_date = data.get("scheduled_date") or date.today().isoformat()
    scheduled_time = data.get("scheduled_time", "Morning")
    status = data.get("status", "taken") # "taken", "skipped", "missed"
    notes = data.get("notes", "").strip()

    if not schedule_id:
        return jsonify({"error": "Bad Request", "message": "Schedule ID is required."}), 400

    s_oid = to_object_id(schedule_id)
    sched = db.medication_schedules.find_one({"_id": s_oid, "patient_id": to_object_id(user_id)})
    if not sched:
        return jsonify({"error": "Not Found", "message": "Medication schedule not found."}), 404

    now = datetime.now(timezone.utc)
    log_doc = {
        "schedule_id": s_oid,
        "patient_id": to_object_id(user_id),
        "medicine_name": sched.get("medicine_name"),
        "dosage": sched.get("dosage"),
        "scheduled_date": scheduled_date,
        "scheduled_time": scheduled_time,
        "status": status,
        "taken_at": now if status == "taken" else None,
        "notes": notes,
        "created_at": now
    }

    # Upsert dose log
    db.dose_logs.update_one(
        {
            "schedule_id": s_oid,
            "scheduled_date": scheduled_date,
            "scheduled_time": scheduled_time
        },
        {"$set": log_doc},
        upsert=True
    )

    safety_notice = ""
    if status == "missed":
        safety_notice = "Safety Guidance: Do not take double or extra doses to make up for a missed dose. Resume with your next regularly scheduled dose."

    return jsonify({
        "message": f"Dose marked as {status}.",
        "safety_notice": safety_notice,
        "log": serialize_doc(log_doc)
    }), 200

# ========================================================
# 4. MEDICATION SAFETY CHECKER
# ========================================================

@medications_bp.route("/safety-check", methods=["POST"])
@jwt_required()
def check_medication_safety():
    """
    Performs algorithmic drug-drug interaction, duplicate active ingredient,
    and patient allergy conflict checking across the provided or active medication list.
    Source-attributed with clinical disclaimers.
    """
    user_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}
    
    medications_input = data.get("medications", [])
    patient_id_input = data.get("patient_id") or user_id

    # If no medications supplied in payload, pull patient's active medication schedules
    if not medications_input:
        schedules = list(db.medication_schedules.find({
            "patient_id": to_object_id(patient_id_input),
            "is_active": True
        }))
        medications_input = [s.get("medicine_name") for s in schedules if s.get("medicine_name")]

    # Normalize medications list
    normalized_meds = [m.lower().strip() for m in medications_input if m]
    if len(normalized_meds) == 0:
        return jsonify({
            "alerts": [],
            "status": "clear",
            "message": "No medications currently recorded to check.",
            "disclaimer": "Safety checks are informational and require pharmacist/doctor clinical evaluation."
        }), 200

    alerts = []

    # 1. DRUG-DRUG INTERACTIONS CHECK
    for interaction in DRUG_INTERACTIONS:
        d1 = interaction["drug1"].lower()
        d2 = interaction["drug2"].lower()
        
        has_d1 = any(d1 in m for m in normalized_meds)
        has_d2 = any(d2 in m for m in normalized_meds)

        if has_d1 and has_d2:
            alerts.append({
                "type": "drug_interaction",
                "severity": interaction["severity"],
                "title": f"Drug Interaction: {interaction['drug1'].title()} + {interaction['drug2'].title()}",
                "description": interaction["interaction_name"],
                "mechanism": interaction["mechanism"],
                "clinical_action": interaction["clinical_action"],
                "source": interaction["source"]
            })

    # 2. DUPLICATE ACTIVE INGREDIENTS CHECK
    for ingredient, rule in DUPLICATE_ACTIVE_INGREDIENTS.items():
        matched_brands = []
        for m in normalized_meds:
            if ingredient in m or any(b.lower() in m for b in rule["common_brands"]):
                matched_brands.append(m)

        if len(matched_brands) > 1:
            alerts.append({
                "type": "duplicate_ingredient",
                "severity": "High",
                "title": f"Duplicate Active Ingredient Detected: {ingredient.title()}",
                "description": f"You appear to be taking multiple medications containing {ingredient.title()} ({', '.join(matched_brands)}).",
                "mechanism": rule["toxicity_warning"],
                "clinical_action": f"Verify cumulative daily dosage with pharmacist. Do not exceed adult maximum of {rule['daily_limit_adult']}.",
                "source": rule["source"]
            })

    # 3. ALLERGY CONFLICTS CHECK
    p_profile = db.patient_profiles.find_one({"user_id": to_object_id(patient_id_input)})
    patient_allergies = (p_profile.get("allergies") or "").lower() if p_profile else ""

    if patient_allergies and "none" not in patient_allergies:
        for allergen, allergy_rule in ALLERGY_CROSS_MAP.items():
            if allergen in patient_allergies:
                for med in normalized_meds:
                    if any(conf in med for conf in allergy_rule["conflicting_drugs"]):
                        alerts.append({
                            "type": "allergy_conflict",
                            "severity": "High",
                            "title": f"Allergy Conflict: {allergy_rule['class_name']}",
                            "description": f"Medication '{med.title()}' conflicts with your recorded allergy to '{allergen.title()}'.",
                            "mechanism": allergy_rule["warning_text"],
                            "clinical_action": "Contraindicated. Immediately alert the prescribing physician or pharmacist before administration.",
                            "source": "Clinical Compendium on Drug Allergies & Hypersensitivity Reactions"
                        })

    overall_status = "alert" if any(a["severity"] == "High" for a in alerts) else "warning" if len(alerts) > 0 else "clear"

    return jsonify({
        "checked_medications": medications_input,
        "alerts_count": len(alerts),
        "status": overall_status,
        "alerts": alerts,
        "source": "Clinical Pharmacology Drug Interaction Compendium & FDA Drug Safety Advisory",
        "last_updated": "2026-10-29",
        "disclaimer": "⚠️ Medication safety alerts are for informational and clinical decision-support purposes. Significant alerts require review by an authorized pharmacist or doctor. Never independently discontinue or alter prescribed dosages without consulting your healthcare provider."
    }), 200
