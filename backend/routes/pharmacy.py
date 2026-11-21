from datetime import datetime, date, timedelta, timezone
from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.db import get_db
from backend.utils.serializers import serialize_doc, serialize_docs, to_object_id
from backend.utils.auth_helpers import role_required
from backend.utils.audit import log_audit, create_notification
from backend.utils.medicine_data import VERIFIED_MEDICINES

pharmacy_bp = Blueprint("pharmacy", __name__, url_prefix="/api/pharmacy")

def compute_inventory_status(item, today_str=None):
    """Dynamically determine inventory status and prevent expired inventory from being marked available."""
    if today_str is None:
        today_str = date.today().isoformat()

    expiry = item.get("expiry_date", "")
    quantity = int(item.get("quantity", 0))
    threshold = int(item.get("stock_threshold", 20))

    if expiry and expiry <= today_str:
        return "expired", False
    elif quantity <= 0:
        return "out_of_stock", False
    elif quantity <= threshold:
        return "low_stock", True
    else:
        return "in_stock", True

@pharmacy_bp.route("/inventory", methods=["GET"])
@role_required("admin", "doctor")
def get_inventory():
    """List pharmacy inventory with search, status filters, and pagination."""
    db = get_db()
    today_str = date.today().isoformat()
    search = request.args.get("search", "").strip()
    status_filter = request.args.get("status", "").strip()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))

    query = {}
    if search:
        query["$or"] = [
            {"medicine_name": {"$regex": search, "$options": "i"}},
            {"generic_name": {"$regex": search, "$options": "i"}},
            {"batch_number": {"$regex": search, "$options": "i"}},
            {"barcode": {"$regex": search, "$options": "i"}},
            {"supplier": {"$regex": search, "$options": "i"}}
        ]

    items = list(db.pharmacy_inventory.find(query).sort("expiry_date", 1))

    # Evaluate dynamic status and dispensability
    processed = []
    for item in items:
        status, dispensable = compute_inventory_status(item, today_str)
        item["status"] = status
        item["is_dispensable"] = dispensable

        # Apply status filter if present
        if not status_filter or status == status_filter:
            processed.append(item)

    total = len(processed)
    start = (page - 1) * limit
    paginated = processed[start:start + limit]

    return jsonify({
        "inventory": serialize_docs(paginated),
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1
    }), 200

@pharmacy_bp.route("/inventory/<id>", methods=["GET"])
@role_required("admin", "doctor")
def get_inventory_item(id):
    db = get_db()
    oid = to_object_id(id)
    item = db.pharmacy_inventory.find_one({"_id": oid})
    if not item:
        return jsonify({"error": "Not Found", "message": "Inventory batch not found."}), 404

    status, dispensable = compute_inventory_status(item)
    item["status"] = status
    item["is_dispensable"] = dispensable

    return jsonify({"item": serialize_doc(item)}), 200

@pharmacy_bp.route("/inventory", methods=["POST"])
@role_required("admin", "doctor")
def create_inventory_item():
    """Create a new pharmacy inventory batch with stock thresholds and expiry validation."""
    user_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}

    medicine_name = data.get("medicine_name", "").strip()
    batch_number = data.get("batch_number", "").strip()
    expiry_date = data.get("expiry_date", "").strip()
    quantity = int(data.get("quantity", 0))
    threshold = int(data.get("stock_threshold", 20))

    if not medicine_name or not batch_number or not expiry_date:
        return jsonify({
            "error": "Bad Request",
            "message": "Medicine name, batch number, and expiration date are mandatory fields."
        }), 400

    today_str = date.today().isoformat()
    if expiry_date <= today_str:
        return jsonify({
            "error": "Bad Request",
            "message": "Cannot add already expired pharmaceutical stock into active pharmacy inventory."
        }), 400

    now = datetime.now(timezone.utc)
    item_doc = {
        "medicine_name": medicine_name,
        "generic_name": data.get("generic_name", medicine_name).strip(),
        "brand_name": data.get("brand_name", "").strip(),
        "batch_number": batch_number,
        "barcode": data.get("barcode", "").strip(),
        "quantity": quantity,
        "unit": data.get("unit", "Tablets"),
        "stock_threshold": threshold,
        "expiry_date": expiry_date,
        "supplier": data.get("supplier", "Authorized Pharmaceutical Dist.").strip(),
        "unit_price": float(data.get("unit_price", 0.50)),
        "location_shelf": data.get("location_shelf", "Shelf A-1").strip(),
        "created_at": now,
        "updated_at": now
    }

    status, dispensable = compute_inventory_status(item_doc, today_str)
    item_doc["status"] = status
    item_doc["is_dispensable"] = dispensable

    res = db.pharmacy_inventory.insert_one(item_doc)
    item_id = res.inserted_id

    log_audit(user_id, "CREATE_INVENTORY_BATCH", "pharmacy_inventory", item_id, {
        "medicine_name": medicine_name,
        "batch": batch_number,
        "quantity": quantity
    })

    return jsonify({
        "message": "Inventory batch added successfully.",
        "item": serialize_doc(item_doc)
    }), 201

@pharmacy_bp.route("/inventory/<id>", methods=["PUT"])
@role_required("admin", "doctor")
def update_inventory_item(id):
    """Update stock counts, batch attributes, or threshold limits."""
    user_id = get_jwt_identity()
    db = get_db()
    oid = to_object_id(id)
    item = db.pharmacy_inventory.find_one({"_id": oid})

    if not item:
        return jsonify({"error": "Not Found", "message": "Inventory batch not found."}), 404

    data = request.get_json() or {}
    now = datetime.now(timezone.utc)
    updates = {"updated_at": now}

    for field in ["medicine_name", "generic_name", "brand_name", "batch_number", "barcode", "unit", "supplier", "location_shelf"]:
        if field in data:
            updates[field] = str(data[field]).strip()

    if "quantity" in data:
        updates["quantity"] = int(data["quantity"])
    if "stock_threshold" in data:
        updates["stock_threshold"] = int(data["stock_threshold"])
    if "expiry_date" in data:
        updates["expiry_date"] = str(data["expiry_date"]).strip()
    if "unit_price" in data:
        updates["unit_price"] = float(data["unit_price"])

    # Update doc
    db.pharmacy_inventory.update_one({"_id": oid}, {"$set": updates})

    # Re-evaluate status
    updated_item = db.pharmacy_inventory.find_one({"_id": oid})
    status, dispensable = compute_inventory_status(updated_item)
    db.pharmacy_inventory.update_one({"_id": oid}, {"$set": {"status": status, "is_dispensable": dispensable}})
    updated_item["status"] = status
    updated_item["is_dispensable"] = dispensable

    log_audit(user_id, "UPDATE_INVENTORY_BATCH", "pharmacy_inventory", oid, updates)

    return jsonify({
        "message": "Inventory batch updated successfully.",
        "item": serialize_doc(updated_item)
    }), 200

@pharmacy_bp.route("/inventory/<id>", methods=["DELETE"])
@role_required("admin")
def delete_inventory_item(id):
    """Archive or remove an inventory record."""
    user_id = get_jwt_identity()
    db = get_db()
    oid = to_object_id(id)
    res = db.pharmacy_inventory.delete_one({"_id": oid})

    if res.deleted_count == 0:
        return jsonify({"error": "Not Found", "message": "Batch not found."}), 404

    log_audit(user_id, "DELETE_INVENTORY_BATCH", "pharmacy_inventory", oid)
    return jsonify({"message": "Inventory record deleted successfully."}), 200

@pharmacy_bp.route("/alerts", methods=["GET"])
@role_required("admin", "doctor")
def get_inventory_alerts():
    """
    Returns real-time low-stock alerts (< threshold) and near-expiry / expired alerts.
    Prevent expired inventory from being marked as available for dispensing.
    """
    db = get_db()
    today = date.today()
    today_str = today.isoformat()
    sixty_days_ahead = (today + timedelta(days=60)).isoformat()

    items = list(db.pharmacy_inventory.find({}))

    expired_alerts = []
    near_expiry_alerts = []
    low_stock_alerts = []

    for item in items:
        status, dispensable = compute_inventory_status(item, today_str)
        item_data = serialize_doc(item)
        item_data["status"] = status
        item_data["is_dispensable"] = dispensable

        exp = item.get("expiry_date", "")
        qty = int(item.get("quantity", 0))
        threshold = int(item.get("stock_threshold", 20))

        if exp and exp <= today_str:
            item_data["days_remaining"] = 0
            item_data["alert_reason"] = "Expired product - NOT dispensable"
            expired_alerts.append(item_data)
        elif exp and exp <= sixty_days_ahead:
            try:
                exp_date_obj = datetime.strptime(exp, "%Y-%m-%d").date()
                days_left = (exp_date_obj - today).days
            except ValueError:
                days_left = 30
            item_data["days_remaining"] = days_left
            item_data["alert_reason"] = f"Expiring in {days_left} day(s)"
            near_expiry_alerts.append(item_data)

        if qty <= threshold:
            item_data["deficit"] = threshold - qty
            item_data["alert_reason"] = f"Stock level ({qty}) below minimum threshold ({threshold})"
            low_stock_alerts.append(item_data)

    return jsonify({
        "total_alerts": len(expired_alerts) + len(near_expiry_alerts) + len(low_stock_alerts),
        "expired_count": len(expired_alerts),
        "near_expiry_count": len(near_expiry_alerts),
        "low_stock_count": len(low_stock_alerts),
        "expired_inventory": expired_alerts,
        "near_expiry_inventory": near_expiry_alerts,
        "low_stock_inventory": low_stock_alerts
    }), 200

@pharmacy_bp.route("/lookup-barcode", methods=["GET"])
@jwt_required()
def lookup_barcode():
    """
    Searches both pharmacy stock and verified reference catalog by scanned barcode.
    Requires user confirmation of identity; does not guess from visual appearance alone.
    """
    barcode = request.args.get("barcode", "").strip()
    if not barcode:
        return jsonify({"error": "Bad Request", "message": "Barcode parameter is required."}), 400

    db = get_db()

    # 1. Search in pharmacy inventory
    inv_item = db.pharmacy_inventory.find_one({"barcode": barcode})
    if inv_item:
        status, dispensable = compute_inventory_status(inv_item)
        inv_item["status"] = status
        inv_item["is_dispensable"] = dispensable

    # 2. Search in verified medicines compendium
    med_ref = db.medicine_reference.find_one({"barcode": barcode})
    if not med_ref:
        for m in VERIFIED_MEDICINES:
            if m.get("barcode") == barcode:
                med_ref = m
                break

    if not inv_item and not med_ref:
        return jsonify({
            "matched": False,
            "barcode": barcode,
            "message": "No verified pharmaceutical or inventory record matched this barcode. Please confirm barcode or enter generic name manually. Never infer identity from appearance alone."
        }), 404

    return jsonify({
        "matched": True,
        "barcode": barcode,
        "inventory_match": serialize_doc(inv_item) if inv_item else None,
        "reference_match": serialize_doc(med_ref) if med_ref else None,
        "confirmation_prompt": "Please confirm this package matches your physical container before proceeding."
    }), 200
