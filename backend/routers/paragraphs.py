from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from crud import (
    get_paragraphs,
    get_paragraph,
    create_paragraph,
    delete_paragraph,
    get_chats_for_paragraph,
)
from schemas import ParagraphCreate, ParagraphResponse, ChatResponse

router = APIRouter()


# Endpoint zum Erstellen eines neuen Absatzes
@router.post("/", response_model=ParagraphResponse)
def create_paragraph_endpoint(
    paragraph: ParagraphCreate, db: Session = Depends(get_db)
):
    return create_paragraph(db, paragraph)


# Endpoint zum Abrufen aller Absätze
@router.get("/", response_model=list[ParagraphResponse])
def get_paragraphs_endpoint(db: Session = Depends(get_db)):
    return get_paragraphs(db)


# Endpoint zum Abrufen eines Absatzes nach ID
@router.get("/{paragraph_id}", response_model=ParagraphResponse)
def get_paragraph_endpoint(paragraph_id: int, db: Session = Depends(get_db)):
    paragraph = get_paragraph(db, paragraph_id)
    if not paragraph:
        raise HTTPException(status_code=404, detail="Paragraph not found")
    return paragraph


# Endpoint zum Löschen eines Absatzes nach ID
@router.delete("/{paragraph_id}", response_model=dict)
def delete_paragraph_endpoint(paragraph_id: int, db: Session = Depends(get_db)):
    paragraph = delete_paragraph(db, paragraph_id)
    if not paragraph:
        raise HTTPException(status_code=404, detail="Paragraph not found")
    return {"detail": f"Paragraph with id {paragraph_id} deleted"}


# Endpoint zum Abrufen aller Chats für einen bestimmten Absatz
@router.get("/{paragraph_id}/chats/", response_model=list[ChatResponse])
def get_chats_for_paragraph_endpoint(paragraph_id: int, db: Session = Depends(get_db)):
    chats = get_chats_for_paragraph(db, paragraph_id)
    return chats
