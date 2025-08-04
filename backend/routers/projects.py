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
from dbSchemas import (
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


# Endpoint zum Aktualisieren eines Projektes nach ID
@router.put("/{projectId}", response_model=ProjectResponse)
def update_project_endpoint(
    projectId: int, updated_data: ProjectUpdate, db: Session = Depends(get_db)
):
    project = update_project(db, projectId, updated_data)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# Endpoint zum Abrufen aller Projekte
@router.get("/", response_model=list[ProjectResponse])
def get_projects_endpoint(db: Session = Depends(get_db)):
    return get_projects(db)


# Endpoint zum Abrufen eines Projektes nach ID
@router.get("/{projectId}", response_model=ProjectResponse)
def get_project_endpoint(projectId: int, db: Session = Depends(get_db)):
    project = get_project(db, projectId)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# Endpoint zum Löschen eines Projektes nach ID
@router.delete("/{projectId}", response_model=dict)
def delete_project_endpoint(projectId: int, db: Session = Depends(get_db)):
    project = delete_project(db, projectId)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"detail": f"Project with id {projectId} deleted"}


# Endpoint zum Abrufen aller Absätze für ein bestimmtes Projekt
@router.get("/{projectId}/paragraphs/", response_model=list[ParagraphResponse])
def get_paragraphs_for_project_endpoint(projectId: int, db: Session = Depends(get_db)):
    paragraphs = get_paragraphs_for_project(db, projectId)
    return paragraphs


# Endpoint zum Abrufen aller Chats für ein bestimmtes Projekt
@router.get("/{projectId}/chats", response_model=list[ChatResponse])
def get_chats_for_project_endpoint(projectId: int, db: Session = Depends(get_db)):
    chats = get_chats_for_project(db, projectId)
    if not chats:
        raise HTTPException(
            status_code=404, detail="Chats not found for the given project"
        )
    return chats
