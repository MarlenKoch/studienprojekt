from pydantic import BaseModel
from typing import Optional


# Definitionen der Pydantic Modelle
# kontrolliert, ob die alle Werte die required sind gesetzt werden und den richtigen Typ haben


# Project
class ProjectCreate(BaseModel):
    title: str
    mode: int
    starttime: Optional[int] = None
    duration: Optional[int] = None


class ProjectUpdate(BaseModel):
    mode: Optional[int] = None
    starttime: Optional[int] = None
    duration: Optional[int] = None


class ProjectResponse(BaseModel):
    id: int
    title: str
    mode: int
    starttime: int
    duration: int


# Paragraph
class ParagraphCreate(BaseModel):
    project_id: int
    content_json: str


class ParagraphResponse(BaseModel):
    id: int
    project_id: int
    content_json: str


class ParagraphUpdate(BaseModel):
    project_id: Optional[int] = None
    content_json: Optional[str] = None


# Chat
class ChatCreate(BaseModel):
    title: str
    aiModel: str
    task: str
    paragraph_id: int


class ChatResponse(BaseModel):
    id: int
    title: str
    aiModel: str
    task: str
    paragraph_id: int


# Answer
class AnswerCreate(BaseModel):
    task: str
    ai_answer: str
    user_note: str
    chat_id: int


class AnswerResponse(BaseModel):
    id: int
    task: str
    ai_answer: str
    user_note: str
    chat_id: int


class AnswerUpdate(BaseModel):
    task: Optional[str] = None
    chatId: Optional[int] = None

