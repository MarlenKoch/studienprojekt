from pydantic import BaseModel


class ContextInputs(BaseModel):
    paragraphContent: str  # vielleicht nicht als ein string übergeben
    writingStyle: str  # aus Dropdown, also definitiv ein bestimmter String
    userContext: str  # für zusätzliche Angaben, sollte auch '' sein können, wird am ende einfach rangehangen
    previousChatJson: str  # das was davor im chat angegeben wurde, einfach alles rein pasten und die KI machen lassen


class UserPromptInputs(BaseModel):
    task: int
    userPrompt: str


class AiRequest(BaseModel):
    userPrompt: UserPromptInputs
    aiModel: str
    context: ContextInputs


class AiResponse(BaseModel):
    response: str