from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from db import Base


# Speichern von Projekten
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    mode = Column(Integer, index=True)
    starttime = Column(Integer, index=True, nullable=True)
    duration = Column(Integer, index=True, nullable=True)
    
    paragraphs = relationship("Paragraph", back_populates="project", cascade="all, delete-orphan")
    answers = relationship("Answer", back_populates="project", cascade="all, delete-orphan")


# Speichern der einzelnen Paragraphen
class Paragraph(Base):
    __tablename__ = "paragraphs"
    
    id = Column(Integer, primary_key=True, index=True)
    projectId = Column(Integer, ForeignKey("projects.id"), index=True)
    content = Column(String, index=True)
    
    project = relationship("Project", back_populates="paragraphs")
    chats = relationship("Chat", back_populates="paragraph",cascade="all, delete-orphan")


# Speichern der einzelnen Chats
class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    paragraphId = Column(Integer, ForeignKey("paragraphs.id"), index=True)

    answers = relationship("Answer", back_populates="chats")
    paragraph = relationship("Paragraph", back_populates="chats")


# Speichern der einzelnen KI-Antworten
class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    task = Column(Integer, index=True)
    aiModel = Column(String, index=True)
    userPrompt = Column(String, index=True)
    timestamp = Column(Integer, index=True)
    aiAnswer = Column(String, index=True)
    userNote = Column(String, index=True)
    userNoteEnabled = Column(Boolean, index=True)
    chatId = Column(Integer, ForeignKey("chats.id"), index=True)
    projectId = Column(Integer, ForeignKey("projects.id"), index=True)

    chats = relationship("Chat", back_populates="answers")
    project = relationship("Project", back_populates="answers")
