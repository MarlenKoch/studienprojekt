from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from crud import create_chat, get_chats, get_chat, update_chat, get_answers_for_chat
from dbSchemas import ChatResponse, ChatCreate, AnswerResponse


router = APIRouter()


# Endpoint zum Erstellen eines Chats
@router.post("/", response_model=ChatResponse)
def create_chat_endpoint(chat: ChatCreate, db: Session = Depends(get_db)):
    return create_chat(db, chat)


# Endpoint zum Abrufen aller Chats
@router.get("/", response_model=list[ChatResponse])
def get_chats_endpoint(db: Session = Depends(get_db)):
    return get_chats(db)


# Endpoint zum Abrufen eines Chats nach ID
@router.get("/{chatId}", response_model=ChatResponse)
def get_chat_endpoint(chatId: int, db: Session = Depends(get_db)):
    chat = get_chat(db, chatId)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


# Endpoint zum Updaten eines Chats
@router.put("/{chatId}", response_model=ChatResponse)
def update_chat_endpoint(
    chatId: int,
    chat_update: ChatCreate,
    db: Session = Depends(get_db),  # hier ChatUpdate statt Create einfügen
):
    updated_chat = update_chat(db, chatId, chat_update)
    if not updated_chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return updated_chat


# Endpoint zum Abrufen aller Answers für einen bestimmten Chat
@router.get("/{chatId}/answers/", response_model=list[AnswerResponse])
def get_answers_for_chat_endpoint(chatId: int, db: Session = Depends(get_db)):
    answers = get_answers_for_chat(db, chatId)
    return answers
