from fastapi import FastAPI
from db import Base, engine
from routers import chats, paragraphs, projects

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(chats.router, prefix="/chats", tags=["chats"])
app.include_router(paragraphs.router, prefix="/paragraphs", tags=["paragraphs"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
