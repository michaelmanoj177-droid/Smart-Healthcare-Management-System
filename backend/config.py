import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-smart-healthcare-dev-key-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-smart-healthcare-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_EXPIRE_HOURS", 24)))
    
    # MongoDB config (MongoDB Atlas URI or local MongoDB)
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "smart_healthcare_db")
    
    # Rate Limiting
    RATELIMIT_DEFAULT = os.getenv("RATELIMIT_DEFAULT", "200 per day;50 per hour")
    RATELIMIT_STORAGE_URI = "memory://"
    
    # AI Integration
    AI_API_KEY = os.getenv("AI_API_KEY", "")
    AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini") # "gemini", "openai", or "fallback"
    
    # Environment
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
