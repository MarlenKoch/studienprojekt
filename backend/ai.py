from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import ollama
from ollama import chat


app = FastAPI()


class ChatRequest(BaseModel):
    user_prompt: str
    system_info: str


class ChatResponse(BaseModel):
    response: str


@app.post("/aiChat", response_model=ChatResponse)
async def aiChat(request: ChatRequest):
    user_prompt = request.user_prompt
    system_info = request.system_info
    system_prompt = f"You are an assistant specializing in: {system_info}"
    try:
        response = chat(
            model="llama3.2",
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
