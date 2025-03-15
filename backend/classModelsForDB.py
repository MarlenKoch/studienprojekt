from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db import Base


# Klassendefinitionen:
# Speichern von Projekten
class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    sources_json = Column(String, index=True)
    title = Column(String, index=True)
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
    content_json = Column(String, index=True)
    paragraph_id = Column(Integer, ForeignKey("paragraphs.id"), index=True)

    paragraph = relationship("Paragraph", back_populates="chats")
