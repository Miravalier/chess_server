import asyncio
import os
import pickle
import requests
from dataclasses import dataclass
from enum import Enum
from fastapi import FastAPI, WebSocket, HTTPException
from functools import partial
from pydantic import BaseModel
from typing import List, Optional


RECAPTCHA_SECRET_KEY = os.environ["RECAPTCHA_SECRET_KEY"]
ADMIN_KEY = os.environ["ADMIN_KEY"]


class Role(str, Enum):
    PLAYER = "player"
    OFFICIAL = "official"


class Company(str, Enum):
    HHC = "hhc"
    A = "a"
    B = "b"
    C = "c"
    D = "d"


class Cohort(str, Enum):
    MILITARY = "military"
    CIVILIAN = "civilian"
    CONTRACTOR = "contractor"


class Role(str, Enum):
    PLAYER = "player"
    OFFICIAL = "official"


@dataclass
class Player:
    name: str
    roles: List[Role]
    cohort: Cohort
    company: Optional[Company]
    rating: Optional[int]
    contact: str
    wins: int = 0
    losses: int = 0
    pending: bool = True


INITIAL_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"


@dataclass
class DB:
    seq: int = 0
    position: str = INITIAL_POSITION


# Load DB
DB_PATH = "/data/chess.db"
try:
    with open(DB_PATH, "rb") as db_file:
        db = pickle.load(db_file)
except Exception:
    db = DB()


connected_sockets = []


# DB saving background task
async def save_db():
    while True:
        await asyncio.sleep(60 * 5)
        print("Saving db ...")
        with open(DB_PATH, "wb") as db_file:
            pickle.dump(db, db_file)

asyncio.create_task(save_db())


# Async Requests
async def async_get(*args, **kwargs) -> requests.Response:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, partial(requests.get, *args, **kwargs))


async def async_post(*args, **kwargs) -> requests.Response:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, partial(requests.post, *args, **kwargs))


# FastAPI App
app = FastAPI()


@app.get("/api/status")
async def status():
    return {"status": "success"}


@app.get("/api/live-board")
async def live_board():
    return {"status": "success", "position": db.position}


@app.websocket("/api/live-board-ws")
async def live_board_websocket(websocket: WebSocket):
    await websocket.accept()
    connected_sockets.append(websocket)
    while True:
        await asyncio.sleep(10000)


class AdminStatus(BaseModel):
    id: str

@app.post("/api/admin-status")
async def admin_status(request: AdminStatus):
    if request.id != ADMIN_KEY:
        raise HTTPException(401, "Invalid admin key")
    return {"status": "success"}


class AdminSetPosition(BaseModel):
    id: str
    position: str

@app.post("/api/admin-set-position")
async def admin_set_position(request: AdminSetPosition):
    if request.id != ADMIN_KEY:
        raise HTTPException(401, "Invalid admin key")
    seq = db.seq
    position = request.position
    db.seq += 1
    db.position = position
    for websocket in connected_sockets:
        try:
            await websocket.send_json({"position": position, "seq": seq})
        except Exception:
            connected_sockets.remove(websocket)
    return {"status": "success"}


class SignupRequest(BaseModel):
    name: str
    company: Optional[Company]
    cohort: Cohort
    roles: List[Role]
    rating: Optional[int]
    token: Optional[str]
    contact: str

@app.post("/api/signup")
async def signup(request: SignupRequest):
    # Validate parameters
    if not request.name:
        return {"status": "error", "reason": "No name provided."}
    if not request.roles:
        return {"status": "error", "reason": "No roles provided."}
    # Validate reCAPTCHA
    if RECAPTCHA_SECRET_KEY:
        try:
            response = await async_post("https://www.google.com/recaptcha/api/siteverify", data={
                "secret": RECAPTCHA_SECRET_KEY,
                "response": request.token,
            })
            if not response.json().get("success"):
                raise ValueError("failure response")
        except:
            return {"status": "error", "reason": "Google reCAPTCHA failed."}
    # Check for confirmed player
    player = db.players.get(request.name)
    if player and not player.pending:
        return {"status": "error", "reason": "That player is already confirmed."}
    # Add player to DB, de-dupe roles
    player = Player(
        request.name,
        list(set(request.roles)),
        request.cohort,
        request.company,
        request.rating,
        request.contact
    )
    db.players[player.name] = player
    return {"status": "success"}


@app.get("/admin/status")
async def admin_status():
    return {"status": "success"}


@app.get("/admin/list-players")
async def list_players():
    return {"status": "success", "players": db.players}


@app.get("/admin/list-pending-players")
async def list_pending_players():
    return {
        "status": "success",
        "players": {
            name: player
            for name, player in db.players.items()
            if player.pending
        }
    }


@app.get("/admin/list-confirmed-players")
async def list_confirmed_players():
    return {
        "status": "success",
        "players": {
            name: player
            for name, player in db.players.items()
            if not player.pending
        }
    }


class ConfirmPlayerRequest(BaseModel):
    name: str

@app.post("/admin/confirm-player")
async def confirm_player(request: ConfirmPlayerRequest):
    if request.name not in db.players:
        return {"status": "error", "reason": "that player does not exist"}

    db.players[request.name].pending = False
    return {"status": "success"}


class DeletePlayerRequest(BaseModel):
    name: str

@app.post("/admin/delete-player")
async def confirm_player(request: DeletePlayerRequest):
    if request.name not in db.players:
        return {"status": "error", "reason": "that player does not exist"}

    del db.players[request.name]

    return {"status": "success"}


@app.get("/admin/reset-db")
async def reset_db():
    global db
    db = DB()
    return {"status": "success"}


@app.on_event("shutdown")
async def shutdown():
    print("Saving db ...")
    with open(DB_PATH, "wb") as db_file:
        pickle.dump(db, db_file)
    print("Shutting down ...")
