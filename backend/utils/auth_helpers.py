from functools import wraps
from flask import g, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from backend.db import get_db
from backend.utils.serializers import to_object_id

def hash_password(password: str) -> str:
    return generate_password_hash(password, method='pbkdf2:sha256')

def verify_password(password: str, hashed: str) -> bool:
    return check_password_hash(hashed, password)

def get_current_user():
    """Retrieve current authenticated user document or None."""
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        if not user_id:
            return None
        db = get_db()
        user = db.users.find_one({"_id": to_object_id(user_id)})
        return user
    except Exception:
        return None

def role_required(*allowed_roles):
    """
    Decorator to enforce JWT authentication and RBAC roles on Flask routes.
    Example: @role_required('admin') or @role_required('doctor', 'admin')
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception as e:
                return jsonify({"error": "Unauthorized", "message": "Missing or invalid authorization token"}), 401

            user_id = get_jwt_identity()
            db = get_db()
            user = db.users.find_one({"_id": to_object_id(user_id)})

            if not user:
                return jsonify({"error": "Unauthorized", "message": "User account does not exist"}), 401

            if user.get("account_status") == "inactive":
                return jsonify({"error": "Forbidden", "message": "Your account has been deactivated. Please contact support."}), 403

            if allowed_roles and user.get("role") not in allowed_roles:
                return jsonify({
                    "error": "Forbidden",
                    "message": f"Access denied. Requires one of the following roles: {', '.join(allowed_roles)}"
                }), 403

            g.current_user = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator
