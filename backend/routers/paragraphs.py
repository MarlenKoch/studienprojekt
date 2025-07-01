from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from crud import (
    get_paragraphs,
    get_paragraph,
    create_paragraph,
    update_paragraph,
    delete_paragraph,
    get_chats_for_paragraph,
    delete_paragraph_and_answers
)
from dbSchemas import ParagraphCreate, ParagraphResponse, ChatResponse, ParagraphUpdate

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
@router.get("/{paragraphId}", response_model=ParagraphResponse)
def get_paragraph_endpoint(paragraphId: int, db: Session = Depends(get_db)):
    paragraph = get_paragraph(db, paragraphId)
    if not paragraph:
        raise HTTPException(status_code=404, detail="Paragraph not found")
    return paragraph


# Endpoint zum Löschen eines Absatzes nach ID
@router.delete("/{paragraphId}", response_model=dict)
def delete_paragraph_endpoint(paragraphId: int, db: Session = Depends(get_db)):
    paragraph = delete_paragraph(db, paragraphId)
    if not paragraph:
        raise HTTPException(status_code=404, detail="Paragraph not found")
    return {"detail": f"Paragraph with id {paragraphId} deleted"}

# Endpoint zum Löschen eines Absatzes sowie dazugehöriger Answers nach ID (Paragraph löschen ohne Schülermodus)
@router.delete("/with_answers/{paragraphId}", response_model=dict)
def delete_paragraph_with_answers_endpoint(paragraphId: int, db: Session = Depends(get_db)):
    paragraph = delete_paragraph_and_answers(db, paragraphId)
    if not paragraph:
        raise HTTPException(status_code=404, detail="Paragraph not found")
    return {"detail": f"Paragraph with id {paragraphId} and all related Chats and Answers deleted"}


# Endpoint zum Abrufen aller Chats für einen bestimmten Absatz
@router.get("/{paragraphId}/chats/", response_model=list[ChatResponse])
def get_chats_for_paragraph_endpoint(paragraphId: int, db: Session = Depends(get_db)):
    chats = get_chats_for_paragraph(db, paragraphId)
    return chats


# Endpoint zum Aktualisieren eines Absatzes nach ID
@router.put("/{paragraphId}", response_model=ParagraphResponse)
def update_paragraph_endpoint(
    paragraphId: int, updated_data: ParagraphUpdate, db: Session = Depends(get_db)
):
    paragraph = update_paragraph(db, paragraphId, updated_data)
    if not paragraph:
        raise HTTPException(status_code=404, detail="Paragraph not found")
    return paragraph
