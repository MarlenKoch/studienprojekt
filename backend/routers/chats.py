from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from crud import create_chat, get_chats
from schemas import ChatResponse, ChatCreate


router = APIRouter()


@router.post("/", response_model=ChatResponse)
def create_chat_endpoint(chat: ChatCreate, db: Session = Depends(get_db)):
    return create_chat(db, chat)


@router.get("/", response_model=list[ChatResponse])
def get_chats_endpoint(db: Session = Depends(get_db)):
    return get_chats(db)
