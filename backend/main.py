from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import Base, engine
from routers import chats, paragraphs, projects
from sourceDocument import generateSourceDocument
from ai import aiChat, get_models


Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Liste der erlaubten Ursprünge
    allow_credentials=True,
    allow_methods=["*"],  # Erlaubte HTTP-Methoden (z.B., GET, POST, etc.)
    allow_headers=["*"],  # Erlaubte Header
)

app.include_router(chats.router, prefix="/chats", tags=["chats"])
app.include_router(paragraphs.router, prefix="/paragraphs", tags=["paragraphs"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])

app.add_api_route("/aiChat", aiChat, methods=["POST","PUT"], tags=["ai"])

app.add_api_route("/aimodels", get_models, methods=["GET"], tags=["ai"])

app.add_api_route(
    "/promptverzeichnis",
    generateSourceDocument,
    methods=["GET"],
    tags=["promptverzeichnis"],
)
