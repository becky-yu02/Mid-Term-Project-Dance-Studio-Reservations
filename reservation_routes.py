from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, status

from reservation import Reservation, ReservationRequest


reservation_router = APIRouter()

reservation_list = list()
global_id = 0


@reservation_router.get("")
async def get_all_reservations() -> list[Reservation]:
    return reservation_list


@reservation_router.post("", status_code=201)
async def create_new_reservation(reservation: ReservationRequest) -> Reservation:
    # Check for nonsensical time slots
    if reservation.start_time >= reservation.end_time:
        raise HTTPException(
            status_code=400, detail="Start time must be before end time."
        )
    # Check for overlapping reservations
    for existing in reservation_list:
        if existing.room_number == reservation.room_number:
            if (
                reservation.start_time < existing.end_time
                and reservation.end_time > existing.start_time
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Cannot make this reservation. Please check room and time availabilities and try again.",
                )

    global global_id
    global_id += 1
    new_reservation = Reservation(
        id=global_id,
        start_time=reservation.start_time,
        end_time=reservation.end_time,
        room_number=reservation.room_number,
        name = reservation.name,
        desc=reservation.desc,
    )
    reservation_list.append(new_reservation)
    return new_reservation


@reservation_router.put("/{id}")
async def edit_reservation_by_id(
    id: Annotated[int, Path(gt=0, lt=100)], reservation: ReservationRequest
) -> Reservation:
    # Check for nonsensical time slots
    if reservation.start_time >= reservation.end_time:
        raise HTTPException(
            status_code=400, detail="Start time must be before end time."
        )
    # Check for overlapping reservations, skip itself
    for existing in reservation_list:
        if existing.room_number == reservation.room_number and existing.id != id:
            if (
                reservation.start_time < existing.end_time
                and reservation.end_time > existing.start_time
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Cannot update this reservation. Please check room and time availabilities and try again.",
                )

    for i in reservation_list:
        if i.id == id:
            i.start_time = reservation.start_time
            i.end_time = reservation.end_time
            i.name = reservation.name
            i.room_number = reservation.room_number
            i.desc = reservation.desc
            return i

    raise HTTPException(
        status_code=404, detail=f"Reservation with ID={id} was not found."
    )

@reservation_router.get("/{id}")
async def get_reservation_by_id(id: Annotated[int, Path(gt=0, lt=100)]) -> Reservation:
    for reservation in reservation_list:
        if reservation.id == id:
            return reservation
        
    raise HTTPException(status_code=404, detail = f"Item with ID={id} is not found.")

@reservation_router.delete("/{id}")
async def delete_reservation_by_id(id: Annotated[int, Path(gt=0, lt=100)]) -> dict:
    for i in range(len(reservation_list)):
        reservation = reservation_list[i]
        if reservation.id == id:
            reservation_list.pop(i)
            return {
                "message": "Reservation has been deleted.",
                "reservation": reservation,
            }

    raise HTTPException(
        status_code=404, detail=f"Reservation with ID={id} was not found."
    )

