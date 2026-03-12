from typing import Literal

from datetime import datetime

from pydantic import BaseModel


class Reservation(BaseModel):
    id: int
    start_time: datetime
    end_time: datetime
    room_number: Literal[101, 102, 103]
    name: str
    desc: str


class ReservationRequest(BaseModel):
    start_time: datetime
    end_time: datetime
    room_number: Literal[101, 102, 103]
    name: str
    desc: str
