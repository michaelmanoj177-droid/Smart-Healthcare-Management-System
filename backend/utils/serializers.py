from bson import ObjectId
from datetime import datetime, date

def serialize_doc(doc, drop_password=True):
    """Serialize a single MongoDB document to JSON-compatible dictionary."""
    if doc is None:
        return None
    
    serialized = {}
    for key, value in doc.items():
        if drop_password and key in ("password_hash", "password"):
            continue
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, (datetime, date)):
            serialized[key] = value.isoformat()
        elif isinstance(value, list):
            serialized[key] = [
                serialize_doc(item, drop_password) if isinstance(item, dict)
                else str(item) if isinstance(item, ObjectId)
                else item.isoformat() if isinstance(item, (datetime, date))
                else item
                for item in value
            ]
        elif isinstance(value, dict):
            serialized[key] = serialize_doc(value, drop_password)
        else:
            serialized[key] = value
            
    # Include both id and _id as strings for frontend convenience
    if "_id" in serialized and isinstance(serialized["_id"], str):
        serialized["id"] = serialized["_id"]
        
    return serialized

def serialize_docs(docs, drop_password=True):
    """Serialize a list of MongoDB documents."""
    return [serialize_doc(doc, drop_password) for doc in docs]

def to_object_id(id_val):
    """Safely convert a string to ObjectId, returning None if invalid."""
    if not id_val:
        return None
    if isinstance(id_val, ObjectId):
        return id_val
    try:
        return ObjectId(str(id_val))
    except Exception:
        return None
