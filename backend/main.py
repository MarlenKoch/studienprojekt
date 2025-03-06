
from fastapi import FastAPI

app = FastAPI()

# Define your routes here
@app.get("/")
def read_root():
    return {"Hello": "Word"}