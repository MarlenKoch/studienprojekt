from sqlalchemy.orm import Session
from classModelsForDB import Project, Paragraph, Chat
from schemas import ProjectCreate, ParagraphCreate, ChatCreate, ParagraphUpdate


# CRUD for Projects
def get_projects(db: Session):
    return db.query(Project).all()


def get_project(db: Session, project_id: int):
    return db.query(Project).filter(Project.id == project_id).first()


def create_project(db: Session, project_data: ProjectCreate):
    db_project = Project(**project_data.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def delete_project(db: Session, project_id: int):
    project = get_project(db, project_id)
    if project:
        db.delete(project)
        db.commit()
        return project
    return None


# CRUD for Paragraphs
def get_paragraphs(db: Session):
    return db.query(Paragraph).all()


def get_paragraph(db: Session, paragraph_id: int):
    return db.query(Paragraph).filter(Paragraph.id == paragraph_id).first()


def create_paragraph(db: Session, paragraph_data: ParagraphCreate):
    db_paragraph = Paragraph(**paragraph_data.dict())
    db.add(db_paragraph)
    db.commit()
    db.refresh(db_paragraph)
    return db_paragraph


# def update_paragraph(db: Session, paragraph_id: int, updated_data: ParagraphUpdate):
#     paragraph = get_paragraph(db, paragraph_id)
#     if paragraph:
#         for key, value in updated_data.dict().items():
#             setattr(paragraph, key, value)
#             db.commit()
#             db.refresh(paragraph)
#             return paragraph
#         return None


def update_paragraph(db: Session, paragraph_id: int, updated_data: ParagraphUpdate):
    paragraph = get_paragraph(db, paragraph_id)
    if paragraph:
        update_fields = updated_data.dict(exclude_unset=True)
        if update_fields:
            print(f"Update Fields: {update_fields}")
            for key, value in update_fields.items():
                print(f"Updating {key} to {value}")
                setattr(paragraph, key, value)
                print(f"Content JSON before commit: {paragraph.content_json}")
                db.commit()
                db.refresh(paragraph)
                print(f"After Commit: {paragraph.content_json}")
            return paragraph
        print("Paragraph not found or no fields to update.")
    return None


def delete_paragraph(db: Session, paragraph_id: int):
    paragraph = get_paragraph(db, paragraph_id)
    if paragraph:
        db.delete(paragraph)
        db.commit()
        return paragraph
    return None


# CRUD for Chats
def get_chats(db: Session):
    return db.query(Chat).all()


def get_chat(db: Session, chat_id: int):
    return db.query(Chat).filter(Chat.id == chat_id).first()


def create_chat(db: Session, chat_data: ChatCreate):
    db_chat = Chat(**chat_data.dict())
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat


def delete_chat(db: Session, chat_id: int):
    chat = get_chat(db, chat_id)
    if chat:
        db.delete(chat)
        db.commit()
        return chat
    return None


# Relationship specific queries
def get_chats_for_paragraph(db: Session, paragraph_id: int):
    return db.query(Chat).filter(Chat.paragraph_id == paragraph_id).all()


def get_paragraphs_for_project(db: Session, project_id: int):
    return db.query(Paragraph).filter(Paragraph.project_id == project_id).all()
