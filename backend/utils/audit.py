from datetime import datetime, timezone
import logging
from backend.db import get_db
from backend.utils.serializers import to_object_id

logger = logging.getLogger(__name__)

def log_audit(actor_user_id, action, resource_type, resource_id=None, metadata=None):
    """Record an audit trail event in the audit_logs collection."""
    try:
        db = get_db()
        entry = {
            "actor_user_id": to_object_id(actor_user_id) if actor_user_id else None,
            "action": action,
            "resource_type": resource_type,
            "resource_id": str(resource_id) if resource_id else None,
            "timestamp": datetime.now(timezone.utc),
            "metadata": metadata or {}
        }
        db.audit_logs.insert_one(entry)
    except Exception as e:
        logger.error("Failed to log audit event %s: %s", action, e)

def create_notification(user_id, title, message, notification_type="general"):
    """Insert an in-app notification for a user."""
    try:
        db = get_db()
        notif = {
            "user_id": to_object_id(user_id),
            "title": title,
            "message": message,
            "notification_type": notification_type,
            "is_read": False,
            "created_at": datetime.now(timezone.utc)
        }
        db.notifications.insert_one(notif)
    except Exception as e:
        logger.error("Failed to create notification for %s: %s", user_id, e)
