import unittest
import json
from datetime import date, timedelta
from backend.app import create_app
from backend.db import get_db

class MedicationManagementTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

        # Login Admin
        res_adm = cls.client.post("/api/auth/login", json={
            "email": "admin@healthcare.com",
            "password": "Password123!"
        })
        cls.admin_token = res_adm.get_json()["access_token"]

        # Login Doctor
        res_doc = cls.client.post("/api/auth/login", json={
            "email": "arun.doctor@example.com",
            "password": "Password123!"
        })
        cls.doctor_token = res_doc.get_json()["access_token"]

        # Login Patient
        res_pat = cls.client.post("/api/auth/login", json={
            "email": "rahul.patient@example.com",
            "password": "Password123!"
        })
        cls.patient_token = res_pat.get_json()["access_token"]
        cls.patient_id = res_pat.get_json()["user"]["id"]

    # 1. Medicine Reference Information Finder
    def test_01_search_medicine_by_brand_and_generic(self):
        # Search by brand
        res = self.client.get("/api/medications/search?q=Lipitor")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreaterEqual(data["total"], 1)
        med = data["medicines"][0]
        self.assertIn("Atorvastatin", med["generic_name"])
        self.assertIn("warnings", med)
        self.assertIn("known_side_effects", med)
        self.assertTrue(med["is_verified"])
        self.assertIn("source", data)

        # Search by generic
        res_gen = self.client.get("/api/medications/search?q=Metformin")
        self.assertEqual(res_gen.status_code, 200)
        self.assertGreaterEqual(res_gen.get_json()["total"], 1)

    def test_02_unavailable_medicine_monograph(self):
        res = self.client.get("/api/medications/reference/NON_EXISTENT_UNKNOWN_DRUG_999")
        self.assertEqual(res.status_code, 404)
        data = res.get_json()
        self.assertFalse(data.get("is_available", True))
        self.assertIn("unavailable", data["message"].lower())

    # 2. Medication Reminders and Schedules
    def test_03_medication_schedule_creation_and_dose_logging(self):
        # Create schedule
        res = self.client.post(
            "/api/medications/schedules",
            headers={"Authorization": f"Bearer {self.patient_token}"},
            json={
                "medicine_name": "Lisinopril 10mg",
                "dosage": "10 mg",
                "frequency": "Once Daily in the Morning",
                "timing_slots": ["Morning"],
                "start_date": date.today().isoformat(),
                "instructions": "Take with breakfast"
            }
        )
        self.assertEqual(res.status_code, 201)
        schedule = res.get_json()["schedule"]
        schedule_id = schedule["id"]

        # Fetch doses for today
        res_doses = self.client.get(
            f"/api/medications/doses?date={date.today().isoformat()}",
            headers={"Authorization": f"Bearer {self.patient_token}"}
        )
        self.assertEqual(res_doses.status_code, 200)
        doses_data = res_doses.get_json()
        self.assertIn("upcoming_doses", doses_data)
        self.assertIn("completed_doses", doses_data)
        self.assertIn("missed_doses", doses_data)

        # Log dose as taken
        res_log = self.client.post(
            "/api/medications/doses/log",
            headers={"Authorization": f"Bearer {self.patient_token}"},
            json={
                "schedule_id": schedule_id,
                "scheduled_date": date.today().isoformat(),
                "scheduled_time": "Morning",
                "status": "taken",
                "notes": "Taken on time"
            }
        )
        self.assertEqual(res_log.status_code, 200)
        self.assertEqual(res_log.get_json()["log"]["status"], "taken")

        # Test missed dose guidance explicitly states never take double doses
        res_missed = self.client.post(
            "/api/medications/doses/log",
            headers={"Authorization": f"Bearer {self.patient_token}"},
            json={
                "schedule_id": schedule_id,
                "scheduled_date": date.today().isoformat(),
                "scheduled_time": "Morning",
                "status": "missed"
            }
        )
        self.assertIn("double", res_missed.get_json()["safety_notice"].lower())

    # 3. Medication Safety Checker (Interactions, Duplicates, Allergies)
    def test_04_safety_checker_interactions_and_allergies(self):
        # Check Warfarin + Aspirin (High Risk Interaction)
        res_check = self.client.post(
            "/api/medications/safety-check",
            headers={"Authorization": f"Bearer {self.patient_token}"},
            json={
                "medications": ["Warfarin Sodium 5mg", "Aspirin 81mg"]
            }
        )
        self.assertEqual(res_check.status_code, 200)
        data = res_check.get_json()
        self.assertEqual(data["status"], "alert")
        self.assertGreaterEqual(data["alerts_count"], 1)
        alert_types = [a["type"] for a in data["alerts"]]
        self.assertIn("drug_interaction", alert_types)

        # Check Duplicate Acetaminophen
        res_dup = self.client.post(
            "/api/medications/safety-check",
            headers={"Authorization": f"Bearer {self.patient_token}"},
            json={
                "medications": ["Tylenol Extra Strength 500mg", "NyQuil Cold & Flu"]
            }
        )
        self.assertEqual(res_dup.status_code, 200)
        data_dup = res_dup.get_json()
        alert_types_dup = [a["type"] for a in data_dup["alerts"]]
        self.assertIn("duplicate_ingredient", alert_types_dup)

    # 4. Pharmacy Inventory and Expiry Alerts
    def test_05_pharmacy_inventory_expiry_and_rbac(self):
        # Patient trying to access inventory should be FORBIDDEN
        res_forbidden = self.client.get(
            "/api/pharmacy/inventory",
            headers={"Authorization": f"Bearer {self.patient_token}"}
        )
        self.assertEqual(res_forbidden.status_code, 403)

        # Admin accessing inventory alerts
        res_alerts = self.client.get(
            "/api/pharmacy/alerts",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(res_alerts.status_code, 200)
        alerts_data = res_alerts.get_json()
        self.assertIn("expired_inventory", alerts_data)
        self.assertIn("low_stock_inventory", alerts_data)

        # Barcode scanner lookup
        res_bc = self.client.get(
            "/api/pharmacy/lookup-barcode?barcode=030045044910",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        self.assertEqual(res_bc.status_code, 200)
        self.assertTrue(res_bc.get_json()["matched"])
        self.assertIn("confirmation_prompt", res_bc.get_json())

if __name__ == "__main__":
    unittest.main()
