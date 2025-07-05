from fastapi import APIRouter
from controllers.chat_controllers import fetch_chat_messages

router = APIRouter()


@router.get("/get-chat-messages/{user_id}")
def get_chat_messages(user_id: str):
    return fetch_chat_messages(user_id)
