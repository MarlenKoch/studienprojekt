from pydantic import BaseModel
from typing import Optional


# Definitionen der Pydantic Modelle
# kontrolliert, ob die alle Werte die required sind gesetzt werden und den richtigen Typ haben


class ProjectCreate(BaseModel):
    title: str
    mode: int


class ProjectResponse(BaseModel):
    id: int
    title: str
    mode: int


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


class ChatCreate(BaseModel):
    title: str
    aiModel: str
    task: str
    content_json: str
    paragraph_id: int


class ChatResponse(BaseModel):
    id: int
    title: str
    aiModel: str
    task: str
    content_json: str
    paragraph_id: int
