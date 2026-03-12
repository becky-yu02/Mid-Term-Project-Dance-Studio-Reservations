let data = [];
const api = 'http://127.0.0.1:8000/Reservations'
let reservationIdInEdit = 0;

document.getElementById('create-btn').addEventListener('click', (event) => {
    event.preventDefault();

    const msgDiv = document.getElementById('msg');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const roomNumberInput = document.getElementById('room-number');
    const nameInput = document.getElementById('name');
    const descInput = document.getElementById('desc');

    if (
    !startTimeInput.value ||
    !endTimeInput.value ||
    !roomNumberInput.value ||
    !nameInput.value ||
    !descInput.value
    ) {
        msgDiv.innerHTML = "Missing information. Please fill in all fields.";
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 201) {
            const newReservation = JSON.parse(xhr.response);
            data.push(newReservation);
            renderReservations(data);

            const closeBtn = document.getElementById('close-create-modal');
            closeBtn.click();

            msgDiv.innerHTML = '';
            startTimeInput.value = '';
            endTimeInput.value = '';
            roomNumberInput.value = '';
            nameInput.value = '';
            descInput.value = '';
        }
        if (xhr.status === 400) {
            const errorResponse = JSON.parse(xhr.responseText);
            msgDiv.innerHTML = errorResponse.detail;
            return;
        }
    };

    xhr.open('POST', api, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify({ 
        start_time: startTimeInput.value,
        end_time: endTimeInput.value,
        room_number: parseInt(roomNumberInput.value),
        name: nameInput.value,
        desc: descInput.value
    }));
});

document.getElementById('edit-btn').addEventListener('click', (event) => {
event.preventDefault();

    const msgDiv = document.getElementById('msg-edit');
    const startTimeInput = document.getElementById('start-time-edit');
    const endTimeInput = document.getElementById('end-time-edit');
    const roomNumberInput = document.getElementById('room-number-edit');
    const nameInput = document.getElementById('name-edit');
    const descInput = document.getElementById('desc-edit');

    if (
    !startTimeInput.value ||
    !endTimeInput.value ||
    !roomNumberInput.value ||
    !nameInput.value ||
    !descInput.value
    ) {
        msgDiv.innerHTML = "Missing information. Please fill in all fields when updating reservation.";
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 200) {
            const newReservation = JSON.parse(xhr.response);
            const reservation = data.find((x) => x.id == reservationIdInEdit);
            reservation.start_time = newReservation.start_time
            reservation.end_time = newReservation.end_time
            reservation.room_number = newReservation.room_number
            reservation.name = newReservation.name
            reservation.desc = newReservation.desc
            renderReservations(data);

            const closeBtn = document.getElementById('close-edit-modal');
            closeBtn.click();

            msgDiv.innerHTML = '';
            startTimeInput.value = '';
            endTimeInput.value = '';
            roomNumberInput.value = '';
            nameInput.value = '';
            descInput.value = '';
        }

        if (xhr.status === 400) {
            const errorResponse = JSON.parse(xhr.responseText);
            msgDiv.innerHTML = errorResponse.detail;
            return;
        }
    };

    xhr.open('PUT', api + '/' + reservationIdInEdit, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify({ 
        start_time: startTimeInput.value,
        end_time: endTimeInput.value,
        room_number: parseInt(roomNumberInput.value),
        name: nameInput.value,
        desc: descInput.value
    }));
});

function deleteReservation(id) {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status == 200) {
            data = data.filter((x) => x.id != id);
            renderReservations(data);
        }
    };

    xhr.open('DELETE', api + '/' + id, true);
    xhr.send();
}

function setReservationInEdit(id) {
    reservationIdInEdit = id;
}

// keep original reservation information as you edit
function openEditModal(id) {
    const reservation = data.find(x => x.id == id);
    reservationIdInEdit = id;

    document.getElementById('start-time-edit').value = reservation.start_time;
    document.getElementById('end-time-edit').value = reservation.end_time;
    document.getElementById('room-number-edit').value = reservation.room_number;
    document.getElementById('name-edit').value = reservation.name;
    document.getElementById('desc-edit').value = reservation.desc;

    document.getElementById('msg-edit').innerHTML = '';
}

// make time and date more user-friendly and readable
function formatDateTime(datetimeStr) {
    const dt = new Date(datetimeStr);

    let hours = dt.getHours();
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // for noon/midnight times
    hours = hours % 12;
    if (hours === 0) hours = 12;

    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const year = dt.getFullYear();

    return `${hours}:${minutes} ${ampm} ${month}/${day}/${year}`;
}

function renderReservations(data) {
    let reservationDiv = document.getElementById(`reservation-room101`)
    reservationDiv.innerHTML = '';
    reservationDiv = document.getElementById(`reservation-room102`)
    reservationDiv.innerHTML = '';
    reservationDiv = document.getElementById(`reservation-room103`)
    reservationDiv.innerHTML = '';
    data
        .sort((a,b) => new Date(a.start_time) - new Date(b.start_time))
        .forEach(x => {
            let reservationRoomDiv = document.getElementById(`reservation-room${x.room_number}`)
            
            reservationRoomDiv.innerHTML += `
        <div id="reservation-${x.id}" class="reservation-box p-3 mb-2 rounded">
            <div class="fw-bold fs-5">${x.name} - Room ${x.room_number}</div>
            <div class="text-secondary">
                ${formatDateTime(x.start_time)} to ${formatDateTime(x.end_time)}
            </div>
            <div class="mt-4">${x.desc}</div>
            <div class="mt-4">
            <button type="button" class="btn btn-success btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#modal-edit-reservation"
              onClick="openEditModal(${x.id})"
            >
              Edit
            </button>
            <button type="button" class="btn btn-danger btn-sm"
              onClick="deleteReservation(${x.id})"
            >
            Delete
          </button>
        </div>
    </div>
    `;
    });
}

function getAllReservations() {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status == 200) {
            data = JSON.parse(xhr.response) || [];
            console.log(data);
            renderReservations(data);
        }
    };

    xhr.open('GET', api, true);
    xhr.send();
}

(() => {
    getAllReservations();
})();