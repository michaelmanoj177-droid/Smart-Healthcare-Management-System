from flask import Blueprint, request, jsonify
from backend.utils.ai_service import generate_ai_response

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")

@ai_bp.route("/chat", methods=["POST"])
def ai_chat():
    data = request.get_json() or {}
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"error": "Bad Request", "message": "Message text is required."}), 400

    if len(message) > 1000:
        return jsonify({"error": "Bad Request", "message": "Message exceeds maximum length (1000 characters)."}), 400

    response = generate_ai_response(message)
    return jsonify(response), 200
