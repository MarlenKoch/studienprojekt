from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import ollama
from ollama import chat


app = FastAPI()


class ContextInputs(BaseModel):
    paragraph_content: str  # vielleicht nicht als ein string übergeben
    writing_style: str  # aus Dropdown, also definitiv ein bestimmter String
    task: str  # aus Dropdown, also definitiv ein bestimmter String
    user_context: str  # für zusätzliche Angaben, sollte auch '' sein können, wird am ende einfach rangehangen


class ChatRequest(BaseModel):
    user_prompt: str
    ai_model: str
    context_inputs: ContextInputs


class ChatResponse(BaseModel):
    response: str


def assembleSystemInfo(context_inputs: ContextInputs) -> str:
    system_info = f"""
    Paragraph Content: {context_inputs.paragraph_content}
    Writing Style: {context_inputs.writing_style}
    Task: {context_inputs.task}
    User Context: {context_inputs.user_context}
    """
    return system_info


@app.post("/aiChat", response_model=ChatResponse)
async def aiChat(request: ChatRequest):
    user_prompt = request.user_prompt
    system_info = assembleSystemInfo(request.context_inputs)
    system_prompt = f"{system_info}"
    try:
        response = chat(
            model=request.ai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        model_response = response["message"]["content"]

        return ChatResponse(response=model_response)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="An error occurred while fetching the response."
        )
