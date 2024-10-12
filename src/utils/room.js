const roomList = {};

const updateRoomListOnUserAdd = (room)=>{
    if (!roomList[room]) roomList[room]=1;
    else roomList[room] = roomList[room]+1;
}

const updateRoomListOnUserRemove = (room)=>{
    if (roomList[room] === 1) delete roomList[room];
    else roomList[room] = roomList[room]-1;
}

const getRooms = ()=>{
    return Object.keys(roomList);
}

module.exports = {
    updateRoomListOnUserAdd,
    updateRoomListOnUserRemove,
    getRooms
};