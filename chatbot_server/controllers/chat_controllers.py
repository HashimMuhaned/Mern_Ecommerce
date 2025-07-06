from fastapi import HTTPException
from bson import ObjectId
from database import get_database

db = get_database()

conversation_collection = db["conversations"]


def fetch_chat_messages(user_id: str):
    try:
        ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user_record = conversation_collection.find_one({"session_id": user_id})
    if not user_record:
        return {"messages": []}

    return {"messages": user_record.get("messages", [])}
