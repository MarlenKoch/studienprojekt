from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from crud import (
    create_answer,
    get_answer,
    get_answers,
    update_answer,
    get_answers_for_chat,
)
from dbSchemas import AnswerCreate, AnswerResponse, AnswerUpdate


router = APIRouter()


# Endpoint zum Erstellen einer Answer
@router.post("/", response_model=AnswerResponse)
def create_answer_endpoint(answer: AnswerCreate, db: Session = Depends(get_db)):
    return create_answer(db, answer)


# Endpoint zum Abrufen aller Answers
@router.get("/", response_model=list[AnswerResponse])
def get_answers_endpoint(db: Session = Depends(get_db)):
    return get_answers(db)


# Endpoint zum Abrufen einer Answer nach ID
@router.get("/{answer_id}", response_model=AnswerResponse)
def get_answer_endpoint(answer_id: int, db: Session = Depends(get_db)):
    answer = get_answer(db, answer_id)
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    return answer


# Endpoint zum Updaten von Answer
@router.put("/{answer_id}", response_model=AnswerResponse)
def update_answer_endpoint(
    answer_id: int, answer_update: AnswerUpdate, db: Session = Depends(get_db)
):
    updated_answer = update_answer(db, answer_id, answer_update)
    if not updated_answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    return updated_answer
