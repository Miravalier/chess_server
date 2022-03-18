from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()


@app.get("/api/status")
async def index():
    return {"status": "success"}


@app.on_event("shutdown")
async def shutdown():
    print("Shutting down ...")