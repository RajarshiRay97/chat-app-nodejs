const socket = io();

// Elements
const joinRoomForm = document.getElementById('join-room-form');
const roomListOptions = document.getElementById('roomListOptions');

socket.on('roomList', (rooms)=>{
    let html;
    for (let i=0;i<rooms.length;i++){
        html = html + `<option value="${rooms[i]}">`;
    }
    roomListOptions.innerHTML=html;
});

joinRoomForm.addEventListener('submit',()=>{
    joinRoomForm.action = '../chat.html';
});