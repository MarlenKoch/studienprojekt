from pydantic import BaseModel


# Definitionen der Pydantic Modelle
# kontrolliert, ob die alle Werte die required sind gesetzt werden und den richtigen Typ haben


class ProjectCreate(BaseModel):
    sources_json: str


class ProjectResponse(BaseModel):
    id: int
    sources_json: str


class ParagraphCreate(BaseModel):
    project_id: int
    content_json: str


class ParagraphResponse(BaseModel):
    id: int
    project_id: int
    content_json: str


class ChatCreate(BaseModel):
    title: str
    aiModel: str
    content_json: str
    paragraph_id: int


class ChatResponse(BaseModel):
    id: int
    title: str
    aiModel: str
    content_json: str
    paragraph_id: int
