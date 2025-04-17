from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import ollama
from ollama import chat
import httpx


app = FastAPI()


class ContextInputs(BaseModel):
    paragraph_content: str  # vielleicht nicht als ein string übergeben
    writing_style: str  # aus Dropdown, also definitiv ein bestimmter String
    user_context: str  # für zusätzliche Angaben, sollte auch '' sein können, wird am ende einfach rangehangen
    previous_chat_json: str # das was davor im chat angegeben wurde, einfach alles rein pasten und die KI machen lassen


class UserPromptInputs(BaseModel):
    task: str
    user_prompt: str


class ChatRequest(BaseModel):
    user_prompt: UserPromptInputs
    ai_model: str
    context_inputs: ContextInputs


class ChatResponse(BaseModel):
    response: str


def assembleSystemInfo(context_inputs: ContextInputs) -> str:
    system_info = f"""
    Paragraph Content: {context_inputs.paragraph_content}
    Writing Style: {context_inputs.writing_style}
    User Context: {context_inputs.user_context}
    Previous Conversations: {context_inputs.previous_chat_json}
    """
    return system_info


def assembleUserPrompt(user_promt_inputs: UserPromptInputs) -> str:
    user_prompt = f"""
    Task: {user_promt_inputs.task}
    User Prompt: {user_promt_inputs.user_prompt}
    """
    return user_prompt


@app.post("/aiChat", response_model=ChatResponse)
async def aiChat(request: ChatRequest):
    user_info = assembleUserPrompt(request.user_prompt)
    user_prompt = f"{user_info}"
    system_info = assembleSystemInfo(request.context_inputs)
    system_prompt = f"{system_info}"
    try:
        response = chat(
            model=request.ai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            # options={"temperature": 1},
            # format={
            #     "type": "object",
            #     "properties": {
            #         "age": {"type": "integer"},
            #         "available": {"type": "boolean"},
            #     },
            #     "required": ["age", "available"],
            # },
        )
        model_response = response["message"]["content"]

        return ChatResponse(response=model_response)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="An error occurred while fetching the response."
        )
            
        
@app.get("/aimodels")
async def get_models():
    try:
        # Use httpx to send a GET request to the Ollama endpoint
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags")
            response.raise_for_status()
        data = response.json()
        return data
    except httpx.HTTPStatusError as http_exc:
        # Handle HTTP errors
        raise HTTPException(status_code=http_exc.response.status_code, detail="Failed to retrieve model tags")
    except Exception as exc:
        # Handle any other exceptions
        raise HTTPException(status_code=500, detail=str(exc))
