from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ollama import chat
from aiSchemas import ContextInputs, UserPromptInputs, AiResponse, AiRequest
import httpx


app = FastAPI()


def assembleSystemInfo(context: ContextInputs) -> str:
    system_info = f"""
    Paragraph Content: {context.paragraphContent}
    Writing Style: {context.writingStyle}
    User Context: {context.userContext}
    Previous Conversations: {context.previousChatJson}
    """
    return system_info


def assembleUserPrompt(user_promt_inputs: UserPromptInputs) -> str:
    userPrompt = f"""
    Task: {user_promt_inputs.task}
    User Prompt: {user_promt_inputs.userPrompt}
    """
    return userPrompt


@app.post("/aiChat", response_model=AiResponse)
async def aiChat(request: AiRequest):
    user_info = assembleUserPrompt(request.userPrompt)
    userPrompt = f"{user_info}"
    system_info = assembleSystemInfo(request.context)
    system_prompt = f"{system_info}"
    try:
        response = chat(
            model=request.aiModel,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": userPrompt},
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
