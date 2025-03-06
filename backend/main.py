
from fastapi import FastAPI

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

import json

app = FastAPI()

DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()



class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    aiModel = Column(String, index=True)
    content_json = Column(String, index=True)
    
    
Base.metadata.create_all(bind=engine)

# Define your routes here
# @app.get("/")
# def read_root():
#     return {"Hello": "Word"}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@app.post("/chats/", response_model=Chat)
def create_chat(chat: ChatCreate, db:Session=Deponds(get_db))