from typing import Optional
from pydantic import BaseModel


class ContextInputs(BaseModel):
    paragraphContent: str  # vielleicht nicht als ein string übergeben
    writingStyle: str  # aus Dropdown, also definitiv ein bestimmter String
    userContext: str  # für zusätzliche Angaben, sollte auch '' sein können, wird am ende einfach rangehangen
    previousChatJson: str  # das was davor im chat angegeben wurde, einfach alles rein pasten und die KI machen lassen


class UserPromptInputs(BaseModel):
    task: int
    userPrompt: str
    synonym: Optional[str] = None


# diese Felder werden jeweils getrennt verarbeitet beim AI Aufruf
# das was vom Frontend kommt
class AiRequest(BaseModel):
    userPrompt: UserPromptInputs #siehe oben
    aiModel: str
    context: ContextInputs #siehe oben


class AiResponse(BaseModel):
    response: str