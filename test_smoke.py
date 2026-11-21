import unittest
from backend.app import create_app
from backend.db import get_db

class SmokeTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def test_departments(self):
        res = self.client.get("/api/departments")
        self.assertEqual(res.status_code, 200)
        depts = res.get_json()["departments"]
        self.assertGreaterEqual(len(depts), 6)

    def test_doctors_list(self):
        res = self.client.get("/api/doctors")
        self.assertEqual(res.status_code, 200)
        docs = res.get_json()["doctors"]
        self.assertGreaterEqual(len(docs), 5)

    def test_login_flow(self):
        # Admin
        res_adm = self.client.post("/api/auth/login", json={
            "email": "admin@healthcare.com",
            "password": "Password123!"
        })
        self.assertEqual(res_adm.status_code, 200)
        adm_token = res_adm.get_json()["access_token"]

        # Doctor
        res_doc = self.client.post("/api/auth/login", json={
            "email": "arun.doctor@example.com",
            "password": "Password123!"
        })
        self.assertEqual(res_doc.status_code, 200)
        doc_token = res_doc.get_json()["access_token"]

        # Patient
        res_pat = self.client.post("/api/auth/login", json={
            "email": "rahul.patient@example.com",
            "password": "Password123!"
        })
        self.assertEqual(res_pat.status_code, 200)
        pat_token = res_pat.get_json()["access_token"]

        # Admin stats with admin token
        res_stats = self.client.get("/api/admin/stats", headers={"Authorization": f"Bearer {adm_token}"})
        self.assertEqual(res_stats.status_code, 200)

        # Patient attempts to access admin stats -> 403 Forbidden
        res_forbid = self.client.get("/api/admin/stats", headers={"Authorization": f"Bearer {pat_token}"})
        self.assertEqual(res_forbid.status_code, 403)

if __name__ == "__main__":
    unittest.main()
