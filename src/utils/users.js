const { updateRoomListOnUserAdd, updateRoomListOnUserRemove} = require('./room');

const users = [];

// addUser
const addUser = ({id, username, room})=>{
    // Clean data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) return {error: 'Username and Room are required!'};

    // Validate if the given username is already there or not in the provided room
    const existingUser = users.find(user=>user.room === room && user.username === username);
    if (existingUser) return {error: 'Username is already in use!'};

    // Store User
    const user = {id, username, room};
    users.push(user);
    updateRoomListOnUserAdd(room);
    return {user};
}

// removeUser
const removeUser = (id)=>{
    const index = users.findIndex(user=>user.id === id);

    if (index !== -1){
        const room = users[index].room;
        updateRoomListOnUserRemove(room);
        return users.splice(index, 1)[0];
    }
}

// getUser
const getUser = (id)=>{
    return users.find(user=>user.id===id);
}

// getUsersInRoom
const getUsersInRoom = (room)=>{
    return users.filter(user=>user.room===room.trim().toLowerCase());
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};