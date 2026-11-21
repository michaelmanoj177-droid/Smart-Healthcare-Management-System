import unittest
import json
from backend.app import create_app
from backend.db import get_db

class HealthcareApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")

    def test_02_admin_login(self):
        res = self.client.post("/api/auth/login", json={
            "email": "admin@healthcare.com",
            "password": "Password123!"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "admin")

    def test_03_patient_login(self):
        res = self.client.post("/api/auth/login", json={
            "email": "rahul.patient@example.com",
            "password": "Password123!"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "patient")

    def test_04_public_admin_registration_blocked(self):
        res = self.client.post("/api/auth/register", json={
            "full_name": "Intruder Admin",
            "email": "hacker@test.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": "admin"
        })
        self.assertEqual(res.status_code, 403)

    def test_05_doctor_directory_and_availability(self):
        res = self.client.get("/api/doctors")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreaterEqual(len(data["doctors"]), 1)
        doc_id = data["doctors"][0]["id"]

        # Check availability slots
        res_slots = self.client.get(f"/api/doctors/{doc_id}/availability?date=2026-11-02")
        self.assertEqual(res_slots.status_code, 200)
        slots_data = res_slots.get_json()
        self.assertIn("slots", slots_data)

    def test_06_ai_chat_and_emergency_guard(self):
        # General question
        res = self.client.post("/api/ai/chat", json={"message": "What should I ask a cardiologist?"})
        self.assertEqual(res.status_code, 200)
        self.assertIn("reply", res.get_json())

        # Emergency detection
        res_em = self.client.post("/api/ai/chat", json={"message": "I have severe chest pain and cannot breathe"})
        self.assertEqual(res_em.status_code, 200)
        em_data = res_em.get_json()
        self.assertIn("CRITICAL HEALTH ALERT", em_data["reply"])

if __name__ == "__main__":
    unittest.main()
