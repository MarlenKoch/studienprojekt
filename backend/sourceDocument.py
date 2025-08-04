from typing import List
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from crud import get_answers_for_project
from db import get_db

app = FastAPI()


def setTask(task):
    if task == 1:
        return "umformulieren"
    elif task == 2:
        return "zusammenfassen"
    elif task == 3:
        return "Text aus Stichpunkten formulieren"
    elif task == 4:
        return "Synonym finden"
    elif task == 5:
        return "Grammatik und Rechtschreibung überprüfen"
    elif task == 6:
        return "Feedback geben"
    elif task == 7:
        return "erklären"
    elif task == 8:
        return "(Benutzerdefiniert, siehe Prompt)"
    else:
        return ""

# Abfrage aller nötigen Informationen zur Erstellung des KI-Nutzungsverzeichnisses
@app.get("/promptverzeichnis")
async def generateSourceDocument(projectId, db: Session = Depends(get_db)):
    answers = get_answers_for_project(db, projectId)
    result = [
        {
            "id": answer.id,
            "aiModel": answer.aiModel,
            "task": setTask(answer.task),
            "prompt": answer.userPrompt,
            "timestamp": answer.timestamp
        }
        for answer in answers
    ]
    return {"chats": result}
