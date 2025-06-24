from sqlalchemy.orm import Session
from classModelsForDB import Project, Paragraph, Chat, Answer
from schemas import (
    ProjectCreate,
    ParagraphCreate,
    ChatCreate,
    ParagraphUpdate,
    ProjectUpdate,
    AnswerCreate,
    AnswerResponse,
    AnswerUpdate,
)


# CRUD for Projects
def get_projects(db: Session):
    return db.query(Project).all()


def get_project(db: Session, project_id: int):
    return db.query(Project).filter(Project.id == project_id).first()


def create_project(db: Session, project_data: ProjectCreate):
    db_project = Project(**project_data.dict(exclude_unset=True))
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def update_project(db: Session, project_id: int, project_data: ProjectUpdate):
    project = get_project(db, project_id)
    if not project:
        return None
    updated_fields = project_data.dict(exclude_unset=True)  #bei patch für optionale Felder
    for key, value in updated_fields.items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project


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


def update_paragraph(db: Session, paragraph_id: int, updated_data: ParagraphUpdate):
    paragraph = get_paragraph(db, paragraph_id)
    if paragraph:
        update_fields = updated_data.dict(exclude_unset=True)
        if update_fields:
            for key, value in update_fields.items():
                setattr(paragraph, key, value)
                db.commit()
                db.refresh(paragraph)
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


# Update chat function
def update_chat(db: Session, chat_id: int, updated_data: ChatCreate):
    chat = get_chat(db, chat_id)
    if chat:
        update_fields = updated_data.dict(exclude_unset=True)
        if update_fields:
            for key, value in update_fields.items():
                setattr(chat, key, value)
            db.commit()
            db.refresh(chat)
            return chat
    else:
        print("Chat not found or no fields to update.")
    return None


# CRUD für Answers
def get_answers(db: Session):
    return db.query(Answer).all()


def get_answer(db: Session, answer_id: int):
    return db.query(Answer).filter(Answer.id == answer_id).first()


def create_answer(db: Session, answer_data: AnswerCreate):
    db_answer = Answer(**answer_data.dict())
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    return db_answer


def delete_answer(db: Session, answer_id: int):
    answer = get_answer(db, answer_id)
    if answer:
        db.delete(answer)
        db.commit()
        return answer
    return None


def update_answer(db: Session, answer_id: int, answer_data: AnswerUpdate):
    answer = get_answer(db, answer_id)
    if not answer:
        return None
    for key, value in answer_data.dict().items():
        setattr(answer, key, value)
    db.commit()
    db.refresh(answer)
    return answer


# Relationship specific queries
def get_chats_for_paragraph(db: Session, paragraph_id: int):
    return db.query(Chat).filter(Chat.paragraph_id == paragraph_id).all()


def get_paragraphs_for_project(db: Session, project_id: int):
    return db.query(Paragraph).filter(Paragraph.project_id == project_id).all()


def get_chats_for_project(db: Session, project_id: int):
    paragraphs = db.query(Paragraph).filter(Paragraph.project_id == project_id).all()
    paragraph_ids = [paragraph.id for paragraph in paragraphs]
    chats = db.query(Chat).filter(Chat.paragraph_id.in_(paragraph_ids)).all()

    return chats


def get_answers_for_chat(db: Session, chat_id: int):
    return db.query(Answer).filter(Answer.chat_id == chat_id).all()
