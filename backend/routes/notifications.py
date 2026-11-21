from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.db import get_db
from backend.utils.serializers import serialize_docs, to_object_id

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    db = get_db()
    u_oid = to_object_id(user_id)
    notifs = list(db.notifications.find({"user_id": u_oid}).sort("created_at", -1).limit(50))
    return jsonify({"notifications": serialize_docs(notifs)}), 200

@notifications_bp.route("/unread-count", methods=["GET"])
@jwt_required()
def get_unread_count():
    user_id = get_jwt_identity()
    db = get_db()
    u_oid = to_object_id(user_id)
    count = db.notifications.count_documents({"user_id": u_oid, "is_read": False})
    return jsonify({"unread_count": count}), 200

@notifications_bp.route("/<notif_id>/read", methods=["PUT"])
@jwt_required()
def mark_read(notif_id):
    user_id = get_jwt_identity()
    db = get_db()
    db.notifications.update_one(
        {"_id": to_object_id(notif_id), "user_id": to_object_id(user_id)},
        {"$set": {"is_read": True}}
    )
    return jsonify({"message": "Marked as read."}), 200

@notifications_bp.route("/read-all", methods=["PUT"])
@jwt_required()
def mark_all_read():
    user_id = get_jwt_identity()
    db = get_db()
    db.notifications.update_many(
        {"user_id": to_object_id(user_id), "is_read": False},
        {"$set": {"is_read": True}}
    )
    return jsonify({"message": "All notifications marked as read."}), 200
