from typing import Annotated

from fastapi import FastAPI, APIRouter, HTTPException, Path
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from reservation_routes import reservation_router


app = FastAPI(title="Dance Studio Reservations")


@app.get("/")
async def home():
    return FileResponse("./frontend/index.html")


app.include_router(reservation_router, tags=["Reservations"], prefix="/Reservations")


app.mount("/", StaticFiles(directory="frontend"), name="static")
