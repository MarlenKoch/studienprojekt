from sqlalchemy.orm import Session
from classModelsForDB import Project, Paragraph, Chat, Answer
from dbSchemas import (
    ProjectCreate,
    ParagraphCreate,
    ChatCreate,
    ChatUpdate,
    ParagraphUpdate,
    ProjectUpdate,
    AnswerCreate,
    AnswerUpdate,
)


# CRUD for Projects
def get_projects(db: Session):
    return db.query(Project).all()


def get_project(db: Session, projectId: int):
    return db.query(Project).filter(Project.id == projectId).first()


def create_project(db: Session, projectData: ProjectCreate):
    db_project = Project(**projectData.dict(exclude_unset=True))
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def update_project(db: Session, projectId: int, projectData: ProjectUpdate):
    project = get_project(db, projectId)
    if not project:
        return None
    updated_fields = projectData.dict(exclude_unset=True)  #bei patch für optionale Felder
    for key, value in updated_fields.items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, projectId: int):
    project = get_project(db, projectId)
    if project:
        db.delete(project)
        db.commit()
        return project
    return None


# CRUD for Paragraphs
def get_paragraphs(db: Session):
    return db.query(Paragraph).all()


def get_paragraph(db: Session, paragraphId: int):
    return db.query(Paragraph).filter(Paragraph.id == paragraphId).first()


def create_paragraph(db: Session, paragraphData: ParagraphCreate):
    db_paragraph = Paragraph(**paragraphData.dict())
    db.add(db_paragraph)
    db.commit()
    db.refresh(db_paragraph)
    return db_paragraph


def update_paragraph(db: Session, paragraphId: int, updatedData: ParagraphUpdate):
    paragraph = get_paragraph(db, paragraphId)
    if paragraph:
        update_fields = updatedData.dict(exclude_unset=True)
        if update_fields:
            for key, value in update_fields.items():
                setattr(paragraph, key, value)
                db.commit()
                db.refresh(paragraph)
            return paragraph
        print("Paragraph not found or no fields to update.")
    return None


def delete_paragraph(db: Session, paragraphId: int):
    paragraph = get_paragraph(db, paragraphId)
    if paragraph:
        db.delete(paragraph)
        db.commit()
        return paragraph
    return None


# CRUD for Chats
def get_chats(db: Session):
    return db.query(Chat).all()


def get_chat(db: Session, chatId: int):
    return db.query(Chat).filter(Chat.id == chatId).first()


def create_chat(db: Session, chat_data: ChatCreate):
    db_chat = Chat(**chat_data.dict())
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat


def delete_chat(db: Session, chatId: int):
    chat = get_chat(db, chatId)
    if chat:
        db.delete(chat)
        db.commit()
        return chat
    return None


def update_chat(db: Session, chatId: int, updated_data: ChatUpdate):
    chat = get_chat(db, chatId)
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
def get_chats_for_paragraph(db: Session, paragraphId: int):
    return db.query(Chat).filter(Chat.paragraphId == paragraphId).all()


def get_paragraphs_for_project(db: Session, projectId: int):
    return db.query(Paragraph).filter(Paragraph.projectId == projectId).all()


def get_chats_for_project(db: Session, projectId: int):
    paragraphs = db.query(Paragraph).filter(Paragraph.projectId == projectId).all()
    paragraphIds = [paragraph.id for paragraph in paragraphs]
    chats = db.query(Chat).filter(Chat.paragraphId.in_(paragraphIds)).all()

    return chats


def get_answers_for_chat(db: Session, chatId: int):
    return db.query(Answer).filter(Answer.chatId == chatId).all()


def get_answers_for_project(db: Session, projectId: int):
        paragraphs = db.query(Paragraph).filter(Paragraph.projectId == projectId).all()
        paragraphIds = [paragraph.id for paragraph in paragraphs]
        chats = db.query(Chat).filter(Chat.paragraphId.in_(paragraphIds)).all()
        chatIds = [chat.id for chat in chats]
        answers = db.query(Answer).filter(Answer.chatId.in_(chatIds)).all()
        return answers

