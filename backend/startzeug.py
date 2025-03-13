# from fastapi import FastAPI, Depends, HTTPException
# from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker, Session, relationship
# from pydantic import BaseModel
# import json

# app = FastAPI()

# DATABASE_URL = "sqlite:///./schreibassistent.db"

# engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = declarative_base()


# # --------------------
# # Klassendefinitionen:
# # Speichern von Projekten
# class Project(Base):
#     __tablename__ = "projects"
#     id = Column(Integer, primary_key=True, index=True)
#     sources_json = Column(String, index=True)
#     paragraphs = relationship("Paragraph", back_populates="project")


# # Speichern der einzelnen Paragraphen
# class Paragraph(Base):
#     __tablename__ = "paragraphs"
#     id = Column(Integer, primary_key=True, index=True)
#     project_id = Column(Integer, ForeignKey("projects.id"), index=True)
#     content_json = Column(String, index=True)
#     project = relationship("Project", back_populates="paragraphs")
#     chats = relationship("Chat", back_populates="paragraph")


# # Speichern der einzelnen Chats
# class Chat(Base):
#     __tablename__ = "chats"

#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String, index=True)
#     aiModel = Column(String, index=True)
#     content_json = Column(String, index=True)
#     paragraph_id = Column(Integer, ForeignKey("paragraphs.id"), index=True)

#     paragraph = relationship("Paragraph", back_populates="chats")


# # erstellen der Tabellen, entsprechen der vorher definierten Modelle/Klassen
# Base.metadata.create_all(bind=engine)  # wo muss das hin?


# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# # -----------------------------------
# # Definitionen der Pydantic Modelle
# # kontrolliert, ob die alle Werte die required sind gesetzt werden und den richtigen Typ haben


# class ProjectCreate(BaseModel):
#     sources_json: str


# class ProjectResponse(BaseModel):
#     id: int
#     sources_json: str


# class ParagraphCreate(BaseModel):
#     project_id: int
#     content_json: str


# class ParagraphResponse(BaseModel):
#     id: int
#     project_id: int
#     content_json: str


# class ChatCreate(BaseModel):
#     title: str
#     aiModel: str
#     content_json: str
#     paragraph_id: int


# class ChatResponse(BaseModel):
#     id: int
#     title: str
#     aiModel: str
#     content_json: str
#     paragraph_id: int


# # ------------------
# # CRUD Operationen:


# # neues Projekt speichern
# @app.post("/projects/", response_model=ProjectResponse)
# def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
#     db_project = Project(sources_json=project.sources_json)
#     db.add(db_project)
#     db.commit()
#     db.refresh(db_project)
#     return ProjectResponse(id=db_project.id, sources_json=db_project.sources_json)


# # Abfragen aller Projekte
# @app.get("/projects/", response_model=list[ProjectResponse])
# def get_projects(db: Session = Depends(get_db)):
#     projects = db.query(Project).all()
#     return [
#         ProjectResponse(
#             id=project.id,
#             sources_json=project.sources_json,
#         )
#         for project in projects
#     ]


# # Abfragen eines Projektes mit ID
# @app.get("/projects/{project_id}", response_model=ProjectResponse)
# def get_project(project_id: int, db: Session = Depends(get_db)):
#     project = db.query(Project).filter(Project.id == project_id).first()
#     if project is None:
#         raise HTTPException(status_code=404, detail="Project not found")
#     return ProjectResponse(
#         id=project.id,
#         sources_json=project.sources_json,
#     )


# # Löschen eines Projektes mit ID
# @app.delete("/projects/{project_id}", response_model=dict)
# def delete_project(project_id: int, db: Session = Depends(get_db)):
#     project = db.query(Project).filter(Project.id == project_id).first()
#     if project is None:
#         raise HTTPException(status_code=404, detail="Project not found")
#     db.delete(project)
#     db.commit()
#     return {"detail": f"Project with id {project_id} deleted"}


# # neuen Absatz speichern
# @app.post("/paragraphs/", response_model=ParagraphResponse)
# def create_paragraph(paragraph: ParagraphCreate, db: Session = Depends(get_db)):
#     db_paragraph = Paragraph(
#         project_id=paragraph.project_id,
#         content_json=paragraph.content_json,
#     )
#     db.add(db_paragraph)
#     db.commit()
#     db.refresh(db_paragraph)
#     return ParagraphResponse(
#         id=db_paragraph.id,
#         project_id=db_paragraph.project_id,
#         content_json=db_paragraph.content_json,
#     )


# # Abfragen aller Absätze
# @app.get("/paragraphs/", response_model=list[ParagraphResponse])
# def get_paragraphs(db: Session = Depends(get_db)):
#     paragraphs = db.query(Paragraph).all()
#     return [
#         ParagraphResponse(
#             id=paragraph.id,
#             project_id=paragraph.project_id,
#             content_json=paragraph.content_json,
#         )
#         for paragraph in paragraphs
#     ]


# # Abfragen eines Absatzes mit ID
# @app.get("/paragraphs/{paragraph_id}", response_model=ParagraphResponse)
# def get_paragraph(paragraph_id: int, db: Session = Depends(get_db)):
#     paragraph = db.query(Paragraph).filter(Paragraph.id == paragraph_id).first()
#     if paragraph is None:
#         raise HTTPException(status_code=404, detail="Paragraph not found")
#     return ParagraphResponse(
#         id=paragraph.id,
#         project_id=paragraph.project_id,
#         content_json=paragraph.content_json,
#     )


# # Löschen eines Absatzes mit ID
# @app.delete("/paragraphs/{paragraph_id}", response_model=dict)
# def delete_paragraph(paragraph_id: int, db: Session = Depends(get_db)):
#     paragraph = db.query(Paragraph).filter(Paragraph.id == paragraph_id).first()
#     if paragraph is None:
#         raise HTTPException(status_code=404, detail="Paragraph not found")
#     db.delete(paragraph)
#     db.commit()
#     return {"detail": f"Paragraph with id {paragraph_id} deleted"}


# # neuen Chat speichern
# @app.post("/chats/", response_model=ChatResponse)
# def create_chat(chat: ChatCreate, db: Session = Depends(get_db)):
#     db_chat = Chat(
#         title=chat.title,
#         aiModel=chat.aiModel,
#         content_json=chat.content_json,
#         paragraph_id=chat.paragraph_id,
#     )
#     db.add(db_chat)
#     db.commit()
#     db.refresh(db_chat)
#     return ChatResponse(
#         id=db_chat.id,
#         title=db_chat.title,
#         aiModel=db_chat.aiModel,
#         content_json=db_chat.content_json,
#         paragraph_id=db_chat.paragraph_id,
#     )


# # Abfragen aller Chats
# @app.get("/chats/", response_model=list[ChatResponse])
# def get_chats(db: Session = Depends(get_db)):
#     chats = db.query(Chat).all()
#     return [
#         ChatResponse(
#             id=chat.id,
#             title=chat.title,
#             aiModel=chat.aiModel,
#             content_json=chat.content_json,
#             paragraph_id=chat.paragraph_id,
#         )
#         for chat in chats
#     ]


# # Abfragen eines Chats mit ID
# @app.get("/chats/{chat_id}", response_model=ChatResponse)
# def get_chat(chat_id: int, db: Session = Depends(get_db)):
#     chat = db.query(Chat).filter(Chat.id == chat_id).first()
#     if chat is None:
#         raise HTTPException(status_code=404, detail="Chat not found")
#     return ChatResponse(
#         id=chat.id,
#         title=chat.title,
#         aiModel=chat.aiModel,
#         content_json=chat.content_json,
#         paragraph_id=chat.paragraph_id,
#     )


# # Löschen eines Chats mit ID
# @app.delete("/chats/{chat_id}", response_model=dict)
# def delete_chat(chat_id: int, db: Session = Depends(get_db)):
#     chat = db.query(Chat).filter(Chat.id == chat_id).first()
#     if chat is None:
#         raise HTTPException(status_code=404, detail="Chat not found")
#     db.delete(chat)
#     db.commit()
#     return {"detail": f"Chat with id {chat_id} deleted"}


# # ----------------------
# # spezielle Abfragen:


# # Abfragen aller Chats zu einem Absatz
# @app.get("/paragraphs/{paragraph_id}/chats/", response_model=list[ChatResponse])
# def get_chats_for_paragraph(paragraph_id: int, db: Session = Depends(get_db)):
#     chats = db.query(Chat).filter(Chat.paragraph_id == paragraph_id).all()
#     return [
#         ChatResponse(
#             id=chat.id,
#             title=chat.title,
#             aiModel=chat.aiModel,
#             content_json=chat.content_json,
#             paragraph_id=chat.paragraph_id,
#         )
#         for chat in chats
#     ]


# # Abfragen aller Absätze zu einem Projekt
# @app.get("/projects/{project_id}/paragraphs/", response_model=list[ParagraphResponse])
# def get_paragraphs_for_project(project_id: int, db: Session = Depends(get_db)):
#     paragraphs = db.query(Paragraph).filter(Paragraph.project_id == project_id).all()
#     return [
#         ParagraphResponse(
#             id=paragraph.id,
#             project_id=paragraph.project_id,
#             content_json=paragraph.content_json,
#         )
#         for paragraph in paragraphs
#     ]
