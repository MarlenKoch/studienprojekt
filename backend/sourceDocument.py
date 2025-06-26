from typing import List
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from crud import get_answer, get_answers_for_project
from db import get_db
from schemas import AnswerResponse

app = FastAPI()


def allAnswerIDsForProject(projectId: int, db: Session) -> List[int]:
    answers = get_answers_for_project(db, projectId)
    if not answers:
        raise HTTPException(
            status_code=404, detail="Chats not found for the given project"
        )
    return [answer.id for answer in answers]



def infoForOneAnswer(answerId: int, db: Session) -> AnswerResponse:
    answer = get_answer(db, answerId)
    if not answer:
        raise HTTPException(status_code=404, detail="Answer for this chat not found")
    
    return answer


@app.get("/promptverzeichnis")
async def generateSourceDocument(projectId, db: Session = Depends(get_db)):
    answerIds = allAnswerIDsForProject(projectId, db)
    answersInfo = [infoForOneAnswer(answerId, db) for answerId in answerIds]
    result = [
        {
            "id": answer.id,
            "aiModel": answer.aiModel,
            "task": answer.task,
            "prompt": answer.userPrompt,
            "timestamp": answer.timestamp
        }
        for answer in answersInfo
    ]
    return {"chats": result}
