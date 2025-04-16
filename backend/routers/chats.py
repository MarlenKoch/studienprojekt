from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from crud import create_chat, get_chats, get_chat, update_chat
from schemas import ChatResponse, ChatCreate


router = APIRouter()


# Endpoint zum erstellen eines Chats
@router.post("/", response_model=ChatResponse)
def create_chat_endpoint(chat: ChatCreate, db: Session = Depends(get_db)):
    return create_chat(db, chat)


# Endpoint zum Abrufen aller Chats
@router.get("/", response_model=list[ChatResponse])
def get_chats_endpoint(db: Session = Depends(get_db)):
    return get_chats(db)


# Endpoint zum Abrufen eines Chats nach ID
@router.get("/{chat_id}", response_model=ChatResponse)
def get_chat_endpoint(chat_id: int, db: Session = Depends(get_db)):
    chat = get_chat(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


@router.put("/{chat_id}", response_model=ChatCreate)
def update_chat_endpoint(chat_id: int, chat_update: ChatCreate, db: Session = Depends(get_db)):
    updated_chat = update_chat(db, chat_id, chat_update)
    if not updated_chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return updated_chat