from typing import List
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from crud import get_answer, get_answers_for_project
from db import get_db
from dbSchemas import AnswerResponse

app = FastAPI()


def allAnswerIDsForProject(projectId: int, db: Session) -> List[int]:
    try:
        answers = get_answers_for_project(db, projectId)
    except Exception as e:
        if e.status_code == 404:
            raise HTTPException(
                status_code=404, detail="Chats not found for the given project"
            )
    if not answers:
        raise HTTPException(
            status_code=404, detail="Chats not found for the given project"
        )
    return [answer.id for answer in answers]


def infoForOneAnswer(answerId: int, db: Session) -> AnswerResponse:
    try:
        answer = get_answer(db, answerId)
    except Exception as e:
        if e.status_code == 404:
            raise HTTPException(
                status_code=404, detail="Answer for this chat not found"
            )
    if not answer:
        raise HTTPException(status_code=404, detail="Answer for this chat not found")
    
    return answer

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

@app.get("/promptverzeichnis")
async def generateSourceDocument(projectId, db: Session = Depends(get_db)):
    answerIds = allAnswerIDsForProject(projectId, db)
    answersInfo = [infoForOneAnswer(answerId, db) for answerId in answerIds]
    result = [
        {
            "id": answer.id,
            "aiModel": answer.aiModel,
            "task": setTask(answer.task),
            "prompt": answer.userPrompt,
            "timestamp": answer.timestamp
        }
        for answer in answersInfo
    ]
    return {"chats": result}
