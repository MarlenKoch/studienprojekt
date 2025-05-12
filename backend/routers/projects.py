from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from crud import (
    get_projects,
    get_project,
    create_project,
    update_project,
    delete_project,
    get_paragraphs_for_project,
    get_chats_for_project,
)
from schemas import (
    ProjectCreate,
    ProjectResponse,
    ParagraphResponse,
    ChatResponse,
    ProjectUpdate,
)

router = APIRouter()


# Endpoint zum Erstellen eines neuen Projektes
@router.post("/", response_model=ProjectResponse)
def create_project_endpoint(project: ProjectCreate, db: Session = Depends(get_db)):
    return create_project(db, project)


# Endpoint zum Updaten eines Projektes nach ID
@router.put("/{project_id}", response_model=ProjectResponse)
def update_project_endpoint(
    project_id: int, updated_data: ProjectUpdate, db: Session = Depends(get_db)
):
    project = update_project(db, project_id, updated_data)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# Endpoint zum Abrufen aller Projekte
@router.get("/", response_model=list[ProjectResponse])
def get_projects_endpoint(db: Session = Depends(get_db)):
    return get_projects(db)


# Endpoint zum Abrufen eines Projektes nach ID
@router.get("/{project_id}", response_model=ProjectResponse)
def get_project_endpoint(project_id: int, db: Session = Depends(get_db)):
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# Endpoint zum Löschen eines Projektes nach ID
@router.delete("/{project_id}", response_model=dict)
def delete_project_endpoint(project_id: int, db: Session = Depends(get_db)):
    project = delete_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"detail": f"Project with id {project_id} deleted"}


# Endpoint zum Abrufen aller Absätze für ein bestimmtes Projekt
@router.get("/{project_id}/paragraphs/", response_model=list[ParagraphResponse])
def get_paragraphs_for_project_endpoint(project_id: int, db: Session = Depends(get_db)):
    paragraphs = get_paragraphs_for_project(db, project_id)
    return paragraphs


# Endpoint zum Abrufen aller Chats für ein bestimmtes Projekt
@router.get("/projects/{project_id}/chats", response_model=list[ChatResponse])
def get_chats_for_project_endpoint(project_id: int, db: Session = Depends(get_db)):
    chats = get_chats_for_project(db, project_id)
    if not chats:
        raise HTTPException(
            status_code=404, detail="Chats not found for the given project"
        )
    return chats
