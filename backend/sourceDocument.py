from typing import List
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from crud import get_chat, get_chats_for_project
from db import get_db


app = FastAPI()


class SourceRequest(BaseModel):
    project_id: int


class Chat(BaseModel):
    id: int
    content_json: str
    aiModel: str


class ChatResponse(BaseModel):
    id: int
    content_json: str
    aiModel: str


def allChatIDsForProject(project_id: int, db: Session) -> List[int]:
    chats = get_chats_for_project(db, project_id)
    if not chats:
        raise HTTPException(
            status_code=404, detail="Chats not found for the given project"
        )
    return [chat.id for chat in chats]


def infoForOneChat(chatID: int, db: Session) -> Chat:
    chat = get_chat(db, chatID)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    return Chat(
        id=chatID,
        content_json=chat.content_json,
        aiModel=chat.aiModel,
    )

    # TODO: Safe task to db!


@app.get("/promptverzeichnis")
async def generateSourceDocument(project_id: int, db: Session = Depends(get_db)):
    chat_ids = allChatIDsForProject(project_id, db)
    chats_info = [infoForOneChat(chat_id, db) for chat_id in chat_ids]
    result = [
        {
            "id": chat.id,
            "content_json": chat.content_json,
            "aiModel": chat.aiModel,
        }
        for chat in chats_info
    ]
    return {"chats": result}
