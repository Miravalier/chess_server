import asyncio
import pickle
from dataclasses import dataclass, field
from enum import Enum
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, List, Optional


class Role(str, Enum):
    PLAYER = "player"
    OFFICIAL = "official"


@dataclass
class Player:
    name: str
    roles: List[Role]
    rating: Optional[int]
    wins: int = 0
    losses: int = 0
    pending: bool = True


@dataclass
class DB:
    players: Dict[str, Player] = field(default_factory=dict)


# Load DB
DB_PATH = "/data/chess.db"
try:
    with open(DB_PATH, "rb") as db_file:
        db = pickle.load(db_file)
except OSError:
    db = DB()


# DB saving background task
async def save_db():
    while True:
        await asyncio.sleep(60 * 5)
        print("Saving db ...")
        with open(DB_PATH, "wb") as db_file:
            pickle.dump(db, db_file)

asyncio.create_task(save_db())


# FastAPI App
app = FastAPI()


@app.get("/api/status")
async def status():
    return {"status": "success"}


class SignupRequest(BaseModel):
    name: str
    roles: List[Role]
    rating: Optional[int]

@app.post("/api/signup")
async def signup(request: SignupRequest):
    # Validate parameters
    if not request.name:
        return {"status": "error", "reason": "No name provided."}
    if not request.roles:
        return {"status": "error", "reason": "No roles provided."}
    # Check for confirmed player
    player = db.players.get(request.name)
    if player and not player.pending:
        return {"status": "error", "reason": "That player is already confirmed."}
    # Add player to DB, de-dupe roles
    player = Player(request.name, list(set(request.roles)), request.rating)
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
