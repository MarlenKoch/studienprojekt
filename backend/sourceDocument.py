from typing import List
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from crud import get_chat, get_chats_for_project
from db import get_db
import json

app = FastAPI()


class Chat(BaseModel):
    id: int
    aiModel: str
    task: str


def allChatIDsForProject(projectId: int, db: Session) -> List[int]:
    chats = get_chats_for_project(db, projectId)
    if not chats:
        raise HTTPException(
            status_code=404, detail="Chats not found for the given project"
        )
    return [chat.id for chat in chats]


def infoForOneChat(chatID: int, db: Session) -> Chat:
    chat = get_chat(db, chatID)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    parsed_data = json.loads(chat.content_json)
    prompts = [message["user_prompt"] for message in parsed_data["messages"]]
    print(prompts)
    prompts_string_with_comma = ", ".join(prompts)
    return Chat(
        id=chatID,
        content_json=prompts_string_with_comma,
        aiModel=chat.aiModel,
        task=chat.task,
    )


@app.get("/promptverzeichnis")
async def generateSourceDocument(projectId, db: Session = Depends(get_db)):
    chatIds = allChatIDsForProject(projectId, db)
    chats_info = [infoForOneChat(chatId, db) for chatId in chatIds]
    result = [
        {
            "id": chat.id,
            "content_json": chat.content_json,
            "aiModel": chat.aiModel,
            "task": chat.task,
        }
        for chat in chats_info
    ]
    return {"chats": result}
