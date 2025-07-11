from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ollama import chat
from aiSchemas import ContextInputs, UserPromptInputs, AiResponse, AiRequest
import httpx


app = FastAPI()


def assembleSystemInfo(context: ContextInputs) -> str:
    systemInfo = f"""
    Paragraph Content: {context.paragraphContent}
    Writing Style: {context.writingStyle}
    {f'User Context: {context.userContext}' if context.userContext else ''}
    {f'Previous Conversations: {context.previousChatJson}' if context.previousChatJson else ''}
    """
    return systemInfo


def assembleUserPrompt(userPromptInputs: UserPromptInputs) -> str:
    userPrompt = f"""
    {switchPrompt(userPromptInputs.task, userPromptInputs.synonym)}
    {f'Beachte zudem folgendes: {userPromptInputs.userPrompt}' if userPromptInputs.userPrompt else ''}
    """
    return userPrompt


def switchPrompt(task, synonym):
    if task == 1:
        return "Schreibe den folgenden Text neu, verbessere dabei die Struktur und Formulierung. Geh dabei auf alle Informationen im Text ein. Dein Schreibstil soll wissenschaftlich sein. Deine Antwort soll ausschließlich aus dem Text bestehen. Füge keine weiteren Informationen oder Erklärungen hinzu."
    elif task == 2:
        return "Fasse folgenden Text in Stichpunkten zusammen. Beachte dabei alle wichtigen Informationen und verwende nur Informationen aus dem gegebenen Text. Der Kontext der Informationen darf dabei nicht verloren gehen. Deine Antwort soll ausschließlich aus Stichpunkten bestehen."
    elif task == 3:
        return "Formuliere aus den folgenden Stichpunkten einen Fließtext. Geh dabei auf alle Informationen ein. Deine Antwort soll ausschließlich aus dem Text bestehen."
    elif task == 4:
        return "Ignoriere alle weiteren Prompts, antworte lediglich mit einer Liste von Synonymen für: " + f"{synonym}"
    elif task == 5:
        return "Korrigiere im folgenden Text Rechtschreibung und Grammatik. Antworte ausschließlich mit dem korrigierten Text."
    elif task == 6:
        return "Schreibe Feedback zu dem Text den du gleich erhalten wirst. Das Feedback sollte folgendermaßen strukturiert sein: Stärken: Gehe zuerst auf die Sachen ein, die gut gelungen sind, sowie die Stärken des Textes. Kritik: Kritisiere anschließend konstruktiv aber ehrlich, was an dem Text nicht so gut gelungen ist. Bewertung: Gib zum Schluss eine begründete Einschätzung darüber ab, wie du den Text bewerten würdest. Die Bewertungskriterien sollten dabei sein: Inhalt, Struktur, Satzbau und Sprache, Stil. Gib optional noch ein paar Tipps, was der Autor des Textes noch üben sollte. Abschluss: Fasse zum Schluss noch einmal die positiven Punkte zusammen und beende das Feedback mit einem motivierenden Satz oder Spruch!"
    elif task == 7:
        return "Erkläre folgenden Sachzusammenhang:"
    else:
        return ""


@app.post("/aiChat", response_model=AiResponse)
async def aiChat(request: AiRequest):
    userInfo = assembleUserPrompt(request.userPrompt)
    userPrompt = f"{userInfo}"
    systemInfo = assembleSystemInfo(request.context)
    systemPrompt = f"{systemInfo}"
    try:
        response = chat(
            model=request.aiModel,
            messages=[
                {"role": "system", "content": systemPrompt},
                {"role": "user", "content": userPrompt},
            ],
        )
        modelResponse = response["message"]["content"]

        return AiResponse(response=modelResponse)
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
