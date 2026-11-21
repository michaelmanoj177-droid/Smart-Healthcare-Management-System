import os
import sys
from datetime import datetime, date, timedelta, timezone

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.config import Config
from backend.db import get_db
from backend.utils.auth_helpers import hash_password

def seed_database(default_password="Password123!"):
    """
    Development seed script that inserts realistic synthetic data into MongoDB.
    Safe to run repeatedly (idempotent - updates or re-seeds cleanly).
    """
    if os.getenv("FLASK_ENV") == "production":
        print("ERROR: Refusing to seed database in production environment.")
        return False

    db = get_db()
    print("=" * 60)
    print("  SEEDING SMART HEALTHCARE MANAGEMENT SYSTEM (DEVELOPMENT)")
    print("=" * 60)

    # 1. Seed Departments
    departments_data = [
        {"name": "Cardiology", "description": "Comprehensive cardiac care, diagnostics, and heart disease management.", "status": "active"},
        {"name": "Dermatology", "description": "Skin, hair, and nail health, medical and cosmetic dermatology.", "status": "active"},
        {"name": "General Medicine", "description": "Primary healthcare, preventive medicine, and routine wellness.", "status": "active"},
        {"name": "Orthopedics", "description": "Bones, joints, ligaments, spine, and musculoskeletal wellness.", "status": "active"},
        {"name": "Pediatrics", "description": "Infant, child, and adolescent healthcare, growth, and vaccinations.", "status": "active"},
        {"name": "Neurology", "description": "Brain, spinal cord, nerve disorder management, and sleep health.", "status": "active"},
    ]

    dept_map = {}
    for dept in departments_data:
        existing = db.departments.find_one({"name": dept["name"]})
        if existing:
            dept_map[dept["name"]] = existing["_id"]
        else:
            res = db.departments.insert_one(dept)
            dept_map[dept["name"]] = res.inserted_id

    print(f"[OK] Seeded {len(departments_data)} medical departments.")

    # 2. Seed Administrator
    admin_email = "admin@healthcare.com"
    now = datetime.now(timezone.utc)
    admin_user = db.users.find_one({"email": admin_email})
    if not admin_user:
        admin_doc = {
            "full_name": "Chief Medical Administrator",
            "email": admin_email,
            "phone": "+1-555-0100",
            "password_hash": hash_password(default_password),
            "role": "admin",
            "account_status": "active",
            "created_at": now,
            "updated_at": now
        }
        res = db.users.insert_one(admin_doc)
        admin_id = res.inserted_id
    else:
        admin_id = admin_user["_id"]

    print(f"[OK] Seeded Administrator: {admin_email}")

    # 3. Seed Synthetic Doctors
    doctors_spec = [
        {
            "name": "Dr. Arun Kumar",
            "email": "arun.doctor@example.com",
            "specialization": "Cardiology",
            "experience_years": 8,
            "qualifications": "MBBS, MD (Cardiology), FACC",
            "department": "Cardiology",
            "fee": 120.0,
            "reg_num": "MED-CARD-8821",
            "bio": "Senior cardiologist specializing in preventive cardiology, hypertension, and arrhythmia care.",
            "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80"
        },
        {
            "name": "Dr. Priya Sharma",
            "email": "priya.doctor@example.com",
            "specialization": "Dermatology",
            "experience_years": 6,
            "qualifications": "MBBS, MD (Dermatology), FAAD",
            "department": "Dermatology",
            "fee": 95.0,
            "reg_num": "MED-DERM-4309",
            "bio": "Board-certified dermatologist with deep focus on clinical skin conditions and laser therapy.",
            "avatar": "https://images.unsplash.com/photo-1594824813583-05f32a51fef0?w=300&auto=format&fit=crop&q=80"
        },
        {
            "name": "Dr. Karthik Raj",
            "email": "karthik.doctor@example.com",
            "specialization": "General Medicine",
            "experience_years": 10,
            "qualifications": "MBBS, DNB (Internal Medicine)",
            "department": "General Medicine",
            "fee": 75.0,
            "reg_num": "MED-GEN-1024",
            "bio": "Primary care physician dedicated to comprehensive preventive medicine and lifestyle management.",
            "avatar": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80"
        },
        {
            "name": "Dr. Meena Devi",
            "email": "meena.doctor@example.com",
            "specialization": "Pediatrics",
            "experience_years": 7,
            "qualifications": "MBBS, MD (Pediatrics), DCH",
            "department": "Pediatrics",
            "fee": 85.0,
            "reg_num": "MED-PED-5591",
            "bio": "Compassionate pediatrician with expertise in child development, immunizations, and pediatric wellness.",
            "avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80"
        },
        {
            "name": "Dr. Naveen Kumar",
            "email": "naveen.doctor@example.com",
            "specialization": "Orthopedics",
            "experience_years": 5,
            "qualifications": "MBBS, MS (Orthopedics)",
            "department": "Orthopedics",
            "fee": 110.0,
            "reg_num": "MED-ORTH-7740",
            "bio": "Orthopedic specialist focusing on joint health, sports injuries, and conservative rehabilitation.",
            "avatar": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80"
        }
    ]

    doctor_ids = []
    for d in doctors_spec:
        user = db.users.find_one({"email": d["email"]})
        if not user:
            u_doc = {
                "full_name": d["name"],
                "email": d["email"],
                "phone": "+1-555-020" + str(len(doctor_ids)),
                "password_hash": hash_password(default_password),
                "role": "doctor",
                "account_status": "active",
                "created_at": now,
                "updated_at": now
            }
            res = db.users.insert_one(u_doc)
            u_id = res.inserted_id
        else:
            u_id = user["_id"]

        doctor_ids.append(u_id)

        # Profile
        db.doctor_profiles.update_one(
            {"user_id": u_id},
            {"$set": {
                "user_id": u_id,
                "specialization": d["specialization"],
                "qualifications": d["qualifications"],
                "experience_years": d["experience_years"],
                "professional_registration_number": d["reg_num"],
                "verification_status": "verified",
                "department_id": dept_map.get(d["department"]),
                "consultation_fee": d["fee"],
                "biography": d["bio"],
                "profile_image": d["avatar"],
                "updated_at": now
            }, "$setOnInsert": {"created_at": now}},
            upsert=True
        )

        # Ensure availability schedule Mon-Fri
        for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
            db.doctor_availability.update_one(
                {"doctor_id": u_id, "day_of_week": day},
                {"$set": {
                    "doctor_id": u_id,
                    "day_of_week": day,
                    "start_time": "09:00",
                    "end_time": "17:00",
                    "slot_duration_minutes": 30,
                    "is_available": True
                }},
                upsert=True
            )

    print(f"[OK] Seeded {len(doctor_ids)} verified synthetic doctor profiles.")

    # 4. Seed Synthetic Patients
    patients_spec = [
        {"name": "Rahul Kumar", "email": "rahul.patient@example.com", "dob": "1992-05-14", "gender": "Male", "blood": "O+", "allergies": "Penicillin"},
        {"name": "Priya N", "email": "priya.patient@example.com", "dob": "1996-08-22", "gender": "Female", "blood": "B+", "allergies": "None known"},
        {"name": "Sanjay Raj", "email": "sanjay.patient@example.com", "dob": "1988-11-03", "gender": "Male", "blood": "A+", "allergies": "Aspirin, Dust"},
        {"name": "Divya S", "email": "divya.patient@example.com", "dob": "1995-02-18", "gender": "Female", "blood": "AB+", "allergies": "Sulfa drugs"},
        {"name": "Ajay Kumar", "email": "ajay.patient@example.com", "dob": "1984-07-29", "gender": "Male", "blood": "O-", "allergies": "None known"},
    ]

    patient_ids = []
    for idx, p in enumerate(patients_spec):
        user = db.users.find_one({"email": p["email"]})
        if not user:
            u_doc = {
                "full_name": p["name"],
                "email": p["email"],
                "phone": f"+1-555-030{idx}",
                "password_hash": hash_password(default_password),
                "role": "patient",
                "account_status": "active",
                "created_at": now,
                "updated_at": now
            }
            res = db.users.insert_one(u_doc)
            p_id = res.inserted_id
        else:
            p_id = user["_id"]

        patient_ids.append(p_id)

        db.patient_profiles.update_one(
            {"user_id": p_id},
            {"$set": {
                "user_id": p_id,
                "date_of_birth": p["dob"],
                "gender": p["gender"],
                "emergency_contact": f"+1-555-999{idx}",
                "allergies": p["allergies"],
                "blood_group": p["blood"],
                "updated_at": now
            }, "$setOnInsert": {"created_at": now}},
            upsert=True
        )

    print(f"[OK] Seeded {len(patient_ids)} synthetic patient profiles.")

    # 5. Seed Sample Appointments
    # Clear previous synthetic appointments to avoid duplication
    db.appointments.delete_many({})
    db.medical_records.delete_many({})
    db.prescriptions.delete_many({})
    db.notifications.delete_many({})

    today = date.today()
    # 5 Upcoming Appointments
    upcoming_dates = [
        today + timedelta(days=2),
        today + timedelta(days=3),
        today + timedelta(days=4),
        today + timedelta(days=5),
        today + timedelta(days=6)
    ]
    # Adjust to weekdays if weekend
    for i, d in enumerate(upcoming_dates):
        while d.weekday() >= 5:  # Saturday or Sunday
            d += timedelta(days=1)
        upcoming_dates[i] = d

    upcoming_reasons = [
        "Preventive health consultation and annual wellness checkup.",
        "Routine follow-up on seasonal allergy management.",
        "General consultation regarding blood pressure readings.",
        "Review of previously recorded symptoms and minor joint stiffness.",
        "Pediatric wellness assessment and growth check."
    ]

    for i in range(5):
        appt = {
            "patient_id": patient_ids[i % len(patient_ids)],
            "doctor_id": doctor_ids[i % len(doctor_ids)],
            "appointment_date": upcoming_dates[i].strftime("%Y-%m-%d"),
            "start_time": f"{9 + i:02d}:00",
            "end_time": f"{9 + i:02d}:30",
            "reason": upcoming_reasons[i],
            "status": "confirmed" if i % 2 == 0 else "pending",
            "created_at": now - timedelta(days=1),
            "updated_at": now
        }
        res = db.appointments.insert_one(appt)

    # 5 Completed Appointments
    past_dates = [
        today - timedelta(days=14),
        today - timedelta(days=10),
        today - timedelta(days=7),
        today - timedelta(days=4),
        today - timedelta(days=2)
    ]
    completed_reasons = [
        "Cardiovascular risk screening and ECG review.",
        "Dermatological checkup for mild dry skin patch.",
        "Routine follow-up for general fitness and nutritional consultation.",
        "Follow-up on lower back strain and posture ergonomics.",
        "Pediatric immunizations check and dietary advice."
    ]

    for i in range(5):
        p_id = patient_ids[i % len(patient_ids)]
        d_id = doctor_ids[i % len(doctor_ids)]
        c_date = past_dates[i].strftime("%Y-%m-%d")

        appt = {
            "patient_id": p_id,
            "doctor_id": d_id,
            "appointment_date": c_date,
            "start_time": f"{10 + i:02d}:00",
            "end_time": f"{10 + i:02d}:30",
            "reason": completed_reasons[i],
            "status": "completed",
            "created_at": now - timedelta(days=20),
            "updated_at": now - timedelta(days=14)
        }
        a_res = db.appointments.insert_one(appt)
        a_id = a_res.inserted_id

        # Add corresponding synthetic medical record
        rec = {
            "patient_id": p_id,
            "doctor_id": d_id,
            "appointment_id": a_id,
            "consultation_date": c_date,
            "symptoms": "Mild seasonal symptoms and routine health inquiries (Synthetic demo record).",
            "clinical_notes": "Patient is in overall stable health. Vitals normal. Advised lifestyle hydration and regular morning exercise.",
            "diagnosis": "Routine Clinical Health Maintenance (Demonstration record)",
            "allergies": patients_spec[i]["allergies"],
            "follow_up_date": (past_dates[i] + timedelta(days=60)).strftime("%Y-%m-%d"),
            "created_at": now - timedelta(days=10),
            "updated_at": now - timedelta(days=10)
        }
        db.medical_records.insert_one(rec)

        # Add corresponding synthetic prescription
        rx = {
            "patient_id": p_id,
            "doctor_id": d_id,
            "appointment_id": a_id,
            "medicines": [
                {
                    "name": "Multivitamin Complex (Demo)",
                    "dosage": "1 Capsule",
                    "frequency": "Once daily with breakfast",
                    "duration": "30 days",
                    "instructions": "Take after meals with a glass of water."
                },
                {
                    "name": "Vitamin D3 1000 IU (Demo)",
                    "dosage": "1 Tablet",
                    "frequency": "Once daily",
                    "duration": "60 days",
                    "instructions": "Take in the morning."
                }
            ],
            "instructions": "Maintain good hydration (2.5L water/day), balanced diet, and 30 minutes daily walking.",
            "issue_date": c_date,
            "follow_up_date": (past_dates[i] + timedelta(days=60)).strftime("%Y-%m-%d"),
            "created_at": now - timedelta(days=10)
        }
        db.prescriptions.insert_one(rx)

    # 2 Cancelled Appointments
    for i in range(2):
        appt = {
            "patient_id": patient_ids[i],
            "doctor_id": doctor_ids[i],
            "appointment_date": (today + timedelta(days=10 + i)).strftime("%Y-%m-%d"),
            "start_time": "14:00",
            "end_time": "14:30",
            "reason": "Personal schedule conflict - rescheduled consultation.",
            "status": "cancelled",
            "created_at": now - timedelta(days=3),
            "updated_at": now - timedelta(days=1)
        }
        db.appointments.insert_one(appt)

    print("[OK] Seeded 12 sample appointments (5 upcoming, 5 completed, 2 cancelled).")
    print("[OK] Seeded sample medical records and digital prescriptions.")

    # 6. Seed Sample Notifications
    for p_id in patient_ids:
        db.notifications.insert_one({
            "user_id": p_id,
            "title": "Welcome to Apex Medicare",
            "message": "Your health profile is activated. You can book doctor consultations anytime.",
            "notification_type": "general",
            "is_read": False,
            "created_at": now
        })

    for d_id in doctor_ids:
        db.notifications.insert_one({
            "user_id": d_id,
            "title": "Verified Medical Practitioner",
            "message": "Your professional registration has been verified. Your clinic schedule is active.",
            "notification_type": "verification",
            "is_read": True,
            "created_at": now
        })

    print("[OK] Seeded sample notifications.")

    # 7. Seed Verified Medicine Reference Information
    from backend.utils.medicine_data import VERIFIED_MEDICINES
    db.medicine_reference.delete_many({})
    for med in VERIFIED_MEDICINES:
        db.medicine_reference.insert_one(med)
    print(f"[OK] Seeded {len(VERIFIED_MEDICINES)} verified medicine reference monographs.")

    # 8. Seed Pharmacy Inventory (with varying stock and expiry scenarios)
    db.pharmacy_inventory.delete_many({})
    sample_inventory = [
        {
            "medicine_name": "Atorvastatin Calcium 20mg",
            "generic_name": "Atorvastatin Calcium",
            "brand_name": "Lipitor",
            "batch_number": "LIP-2026-B101",
            "barcode": "030045044910",
            "quantity": 140,
            "unit": "Tablets",
            "stock_threshold": 30,
            "expiry_date": (today + timedelta(days=365)).strftime("%Y-%m-%d"),
            "supplier": "Apex Pharma Logistics",
            "unit_price": 0.85,
            "location_shelf": "Shelf A-1 (Cardio)",
            "status": "in_stock",
            "is_dispensable": True,
            "created_at": now,
            "updated_at": now
        },
        {
            "medicine_name": "Metformin Hydrochloride 500mg",
            "generic_name": "Metformin Hydrochloride",
            "brand_name": "Glucophage",
            "batch_number": "GLU-2026-M404",
            "barcode": "030045044934",
            "quantity": 18,  # Low stock below threshold 30!
            "unit": "Tablets",
            "stock_threshold": 30,
            "expiry_date": (today + timedelta(days=240)).strftime("%Y-%m-%d"),
            "supplier": "MetroMed Distributors",
            "unit_price": 0.40,
            "location_shelf": "Shelf B-2 (Endo)",
            "status": "low_stock",
            "is_dispensable": True,
            "created_at": now,
            "updated_at": now
        },
        {
            "medicine_name": "Amoxicillin 500mg",
            "generic_name": "Amoxicillin",
            "brand_name": "Amoxil",
            "batch_number": "AMX-2025-X092",
            "barcode": "030045044941",
            "quantity": 65,
            "unit": "Capsules",
            "stock_threshold": 20,
            "expiry_date": (today - timedelta(days=15)).strftime("%Y-%m-%d"),  # EXPIRED BATCH!
            "supplier": "BioGlobal Health",
            "unit_price": 0.65,
            "location_shelf": "Quarantine Shelf Q-1",
            "status": "expired",
            "is_dispensable": False,  # Safety safeguard: NOT dispensable
            "created_at": now - timedelta(days=400),
            "updated_at": now
        },
        {
            "medicine_name": "Ibuprofen 400mg",
            "generic_name": "Ibuprofen",
            "brand_name": "Advil",
            "batch_number": "IBU-2026-F330",
            "barcode": "030045044958",
            "quantity": 25,
            "unit": "Tablets",
            "stock_threshold": 20,
            "expiry_date": (today + timedelta(days=25)).strftime("%Y-%m-%d"),  # Near Expiry (< 30 days)!
            "supplier": "Apex Pharma Logistics",
            "unit_price": 0.35,
            "location_shelf": "Shelf C-1 (Analgesics)",
            "status": "in_stock",
            "is_dispensable": True,
            "created_at": now,
            "updated_at": now
        },
        {
            "medicine_name": "Lisinopril 10mg",
            "generic_name": "Lisinopril",
            "brand_name": "Zestril",
            "batch_number": "LIS-2026-Z778",
            "barcode": "030045044927",
            "quantity": 200,
            "unit": "Tablets",
            "stock_threshold": 40,
            "expiry_date": (today + timedelta(days=500)).strftime("%Y-%m-%d"),
            "supplier": "MedSource Direct",
            "unit_price": 0.50,
            "location_shelf": "Shelf A-3 (Hypertension)",
            "status": "in_stock",
            "is_dispensable": True,
            "created_at": now,
            "updated_at": now
        },
        {
            "medicine_name": "Acetaminophen 500mg",
            "generic_name": "Acetaminophen",
            "brand_name": "Tylenol",
            "batch_number": "TYL-2026-T890",
            "barcode": "030045044965",
            "quantity": 300,
            "unit": "Caplets",
            "stock_threshold": 50,
            "expiry_date": (today + timedelta(days=450)).strftime("%Y-%m-%d"),
            "supplier": "MetroMed Distributors",
            "unit_price": 0.25,
            "location_shelf": "Shelf C-2 (Analgesics)",
            "status": "in_stock",
            "is_dispensable": True,
            "created_at": now,
            "updated_at": now
        }
    ]
    for item in sample_inventory:
        db.pharmacy_inventory.insert_one(item)
    print(f"[OK] Seeded {len(sample_inventory)} pharmacy inventory records (including low-stock and expired test items).")

    # 9. Seed Patient Medication Schedules & Dose Logs
    db.medication_schedules.delete_many({})
    db.dose_logs.delete_many({})

    rahul_id = patient_ids[0]
    priya_id = patient_ids[1]
    dr_arun_id = doctor_ids[0]
    dr_karthik_id = doctor_ids[2]

    sched1 = {
        "patient_id": rahul_id,
        "doctor_id": dr_arun_id,
        "medicine_name": "Atorvastatin Calcium (Lipitor)",
        "dosage": "20 mg",
        "frequency": "Once Daily at Bedtime",
        "timing_slots": ["Bedtime"],
        "start_date": (today - timedelta(days=10)).strftime("%Y-%m-%d"),
        "end_date": (today + timedelta(days=80)).strftime("%Y-%m-%d"),
        "instructions": "Take with water in the evening. Avoid grapefruit juice.",
        "reminder_enabled": True,
        "is_active": True,
        "missed_dose_guidance": "If you miss a dose, take it as soon as remembered unless it is almost time for your next scheduled dose. Never take extra or double doses.",
        "created_at": now - timedelta(days=10),
        "updated_at": now
    }
    s1_id = db.medication_schedules.insert_one(sched1).inserted_id

    sched2 = {
        "patient_id": rahul_id,
        "doctor_id": dr_karthik_id,
        "medicine_name": "Multivitamin Complex",
        "dosage": "1 Capsule",
        "frequency": "Once Daily",
        "timing_slots": ["Morning"],
        "start_date": (today - timedelta(days=10)).strftime("%Y-%m-%d"),
        "end_date": (today + timedelta(days=20)).strftime("%Y-%m-%d"),
        "instructions": "Take after breakfast with water.",
        "reminder_enabled": True,
        "is_active": True,
        "missed_dose_guidance": "Never take double doses for missed vitamins.",
        "created_at": now - timedelta(days=10),
        "updated_at": now
    }
    s2_id = db.medication_schedules.insert_one(sched2).inserted_id

    sched3 = {
        "patient_id": priya_id,
        "doctor_id": dr_arun_id,
        "medicine_name": "Lisinopril",
        "dosage": "10 mg",
        "frequency": "Once Daily in the Morning",
        "timing_slots": ["Morning"],
        "start_date": (today - timedelta(days=5)).strftime("%Y-%m-%d"),
        "end_date": (today + timedelta(days=90)).strftime("%Y-%m-%d"),
        "instructions": "Take every morning. Check blood pressure periodically.",
        "reminder_enabled": True,
        "is_active": True,
        "missed_dose_guidance": "Do not double dose. Contact clinic if two consecutive doses are missed.",
        "created_at": now - timedelta(days=5),
        "updated_at": now
    }
    s3_id = db.medication_schedules.insert_one(sched3).inserted_id

    # Seed dose logs for today
    today_str = today.strftime("%Y-%m-%d")
    yesterday_str = (today - timedelta(days=1)).strftime("%Y-%m-%d")

    # Rahul took morning multivitamin today
    db.dose_logs.insert_one({
        "schedule_id": s2_id,
        "patient_id": rahul_id,
        "medicine_name": "Multivitamin Complex",
        "dosage": "1 Capsule",
        "scheduled_date": today_str,
        "scheduled_time": "Morning",
        "status": "taken",
        "taken_at": now - timedelta(hours=3),
        "notes": "Taken with breakfast",
        "created_at": now
    })

    # Rahul took yesterday's Lipitor
    db.dose_logs.insert_one({
        "schedule_id": s1_id,
        "patient_id": rahul_id,
        "medicine_name": "Atorvastatin Calcium (Lipitor)",
        "dosage": "20 mg",
        "scheduled_date": yesterday_str,
        "scheduled_time": "Bedtime",
        "status": "taken",
        "taken_at": now - timedelta(hours=18),
        "notes": "Taken at 9:30 PM",
        "created_at": now
    })

    print("[OK] Seeded patient medication schedules and dose logs.")
    print("=" * 60)
    print("DEMO CREDENTIALS FOR TESTING (Default Password for all: Password123!)")
    print("-" * 60)
    print(f"ADMIN:   {admin_email} | Password: {default_password}")
    print("-" * 60)
    print("DOCTORS:")
    for d in doctors_spec:
        print(f"  * {d['name']} ({d['specialization']}): {d['email']} | Password: {default_password}")
    print("-" * 60)
    print("PATIENTS:")
    for p in patients_spec:
        print(f"  * {p['name']}: {p['email']} | Password: {default_password}")
    print("=" * 60)
    return True

if __name__ == "__main__":
    seed_database()
