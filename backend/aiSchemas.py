from typing import Optional
from pydantic import BaseModel


class ContextInputs(BaseModel):
    paragraphContent: str  
    writingStyle: str  
    userContext: str  
    previousChatJson: str  


class UserPromptInputs(BaseModel):
    task: int
    userPrompt: str
    synonym: Optional[str] = None


class AiRequest(BaseModel):
    userPrompt: UserPromptInputs 
    aiModel: str
    context: ContextInputs 


class AiResponse(BaseModel):
    response: str