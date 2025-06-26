from pydantic import BaseModel


class ContextInputs(BaseModel):
    paragraph_content: str  # vielleicht nicht als ein string übergeben
    writing_style: str  # aus Dropdown, also definitiv ein bestimmter String
    user_context: str  # für zusätzliche Angaben, sollte auch '' sein können, wird am ende einfach rangehangen
    previous_chat_json: str  # das was davor im chat angegeben wurde, einfach alles rein pasten und die KI machen lassen


class UserPromptInputs(BaseModel):
    task: str
    user_prompt: str


class AiRequest(BaseModel):
    user_prompt: UserPromptInputs
    ai_model: str
    context_inputs: ContextInputs


class AiResponse(BaseModel):
    response: str