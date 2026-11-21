import logging
from pymongo import MongoClient
import pymongo.errors
from backend.config import Config

logger = logging.getLogger(__name__)

_client = None
_db = None
_is_mock = False

def get_db():
    global _client, _db, _is_mock
    if _db is not None:
        return _db

    mongo_uri = Config.MONGO_URI
    db_name = Config.MONGO_DB_NAME

    try:
        if mongo_uri and "mock" not in mongo_uri.lower():
            # Try connecting to MongoDB Atlas or local MongoDB with 3s timeout
            logger.info("Attempting to connect to MongoDB: %s", mongo_uri.split("@")[-1] if "@" in mongo_uri else mongo_uri)
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
            # Test connection
            client.admin.command('ping')
            _client = client
            _db = _client[db_name]
            _is_mock = False
            logger.info("Successfully connected to live MongoDB (%s)", db_name)
        else:
            raise pymongo.errors.ConnectionFailure("Configured for mock or empty URI")
    except Exception as e:
        logger.warning("Could not connect to MongoDB server (%s). Initializing high-fidelity in-memory MongoDB fallback.", str(e))
        import mongomock
        _client = mongomock.MongoClient()
        _db = _client[db_name]
        _is_mock = True
        logger.info("High-fidelity in-memory MongoDB initialized for (%s)", db_name)

    # Initialize indexes
    init_indexes(_db)
    return _db

def init_indexes(db):
    try:
        db.users.create_index([("email", 1)], unique=True)
        db.appointments.create_index([("doctor_id", 1), ("appointment_date", 1), ("start_time", 1)])
        db.appointments.create_index([("patient_id", 1)])
        db.doctor_profiles.create_index([("user_id", 1)], unique=True)
        db.patient_profiles.create_index([("user_id", 1)], unique=True)
        db.notifications.create_index([("user_id", 1), ("created_at", -1)])
        db.medical_records.create_index([("patient_id", 1)])
        db.prescriptions.create_index([("patient_id", 1)])
        db.audit_logs.create_index([("timestamp", -1)])
        # Tablet and Medication Management indexes
        db.medicine_reference.create_index([("generic_name", 1)])
        db.medicine_reference.create_index([("brand_name", 1)])
        db.medicine_reference.create_index([("barcode", 1)])
        db.medication_schedules.create_index([("patient_id", 1)])
        db.dose_logs.create_index([("patient_id", 1), ("scheduled_date", 1)])
        db.dose_logs.create_index([("schedule_id", 1)])
        db.pharmacy_inventory.create_index([("batch_number", 1)])
        db.pharmacy_inventory.create_index([("barcode", 1)])
        db.pharmacy_inventory.create_index([("expiry_date", 1)])
    except Exception as e:
        logger.debug("Indexes creation note: %s", e)

def is_database_mock():
    return _is_mock
