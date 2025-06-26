from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ollama import chat
from aiSchemas import ContextInputs, UserPromptInputs, AiResponse, AiRequest
import httpx


app = FastAPI()


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


@app.post("/aiChat", response_model=AiResponse)
async def aiChat(request: AiRequest):
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
        )
        model_response = response["message"]["content"]

        return AiResponse(response=model_response)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="An error occurred while fetching the response."
        )


@app.get("/aimodels")
async def getModels():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags")
            response.raise_for_status()
        data = response.json()
        return data
    except httpx.HTTPStatusError as http_exc:
        raise HTTPException(
            status_code=http_exc.response.status_code,
            detail="Failed to retrieve model tags",
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
