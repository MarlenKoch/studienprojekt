from pydantic import BaseModel
from typing import Optional


# Definitionen der Pydantic Modelle

# Project
class ProjectCreate(BaseModel):
    title: str
    mode: int
    starttime: Optional[int] = None
    duration: Optional[int] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    mode: Optional[int] = None
    starttime: Optional[int] = None
    duration: Optional[int] = None


class ProjectResponse(BaseModel):
    id: int
    title: str
    mode: int
    starttime: Optional[int] = None
    duration: Optional[int] = None


# Paragraph
class ParagraphCreate(BaseModel):
    projectId: int
    content: str


class ParagraphResponse(BaseModel):
    id: int
    projectId: int
    content: str


class ParagraphUpdate(BaseModel): 
    content: str


# Chat
class ChatCreate(BaseModel):
    title: str
    paragraphId: int


class ChatResponse(BaseModel):
    id: int
    title: str
    paragraphId: int
    
class ChatUpdate(BaseModel):
    title: str
    


# Answer
class AnswerCreate(BaseModel):
    task: int
    aiModel: str
    userPrompt: Optional[str] = None
    timestamp: int
    aiAnswer: str
    userNote: Optional[str] = None
    userNoteEnabled: Optional[bool] = None
    chatId: int
    projectId: int


class AnswerResponse(BaseModel):
    id: int
    task: int
    aiModel: str
    userPrompt: Optional[str] = None
    timestamp: int
    aiAnswer: str
    userNote: Optional[str] = None
    userNoteEnabled: Optional[bool] = None
    chatId:  Optional[int] = None
    projectId: int


class AnswerUpdate(BaseModel):
    userPrompt: Optional[str] = None
    userNote: Optional[str] = None
    userNoteEnabled: Optional[bool] = None

