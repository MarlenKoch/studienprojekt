from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import Base, engine
from routers import chats, paragraphs, projects, answers
from sourceDocument import generateSourceDocument
from ai import aiChat, checkModels, getModels, pullModel


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(chats.router, prefix="/chats", tags=["chats"])
app.include_router(paragraphs.router, prefix="/paragraphs", tags=["paragraphs"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(answers.router, prefix="/answers", tags=["answers"])

app.add_api_route("/aiChat", aiChat, methods=["POST", "PUT"], tags=["ai"])

app.add_api_route("/aiModels", getModels, methods=["GET"], tags=["ai"])

app.add_api_route(
    "/promptverzeichnis",
    generateSourceDocument,
    methods=["GET"],
    tags=["promptverzeichnis"],
)

app.add_api_route("/pullAiModel", pullModel, methods=["POST"],tags=["ai"])
app.add_api_route("/requiredAiModels", checkModels, methods=["GET"],tags=["ai"])