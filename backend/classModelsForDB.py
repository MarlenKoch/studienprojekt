from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from db import Base


# Klassendefinitionen:
# Speichern von Projekten
class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    mode = Column(Integer, index=True)
    starttime = Column(Integer, index=True)
    duration = Column(Integer, index=True)
    paragraphs = relationship("Paragraph", back_populates="project")


# Speichern der einzelnen Paragraphen
class Paragraph(Base):
    __tablename__ = "paragraphs"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), index=True)
    content_json = Column(String, index=True)
    project = relationship("Project", back_populates="paragraphs")
    chats = relationship("Chat", back_populates="paragraph")


# Speichern der einzelnen Chats
class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    aiModel = Column(String, index=True)
    task = Column(String, index=True)
    content_json = Column(String, index=True)
    paragraph_id = Column(Integer, ForeignKey("paragraphs.id"), index=True)
    answers = relationship("Answer", back_populates="chats")

    paragraph = relationship("Paragraph", back_populates="chats")


# Speichern der einzelnen KI-Antworten
class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    task = Column(String, index=True)
    ai_answer = Column(String, index=True)
    user_note = Column(String, index=True)
    user_note_enabled = Column(Boolean)
    chat_id = Column(Integer, ForeignKey("chats.id"), index=True)

    chats = relationship("Chat", back_populates="answers")
