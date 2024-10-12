const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const path = require('path');
const http = require('http');
const { generateMessage, generateLocationMessage} = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');
const { getRooms} = require('./utils/room');

const app = express();
const server = http.createServer(app);
// to crreate an instance of socket.io to configure the web socket with our server
const io = socketio(server);

const port = process.env.PORT;
const publicDir = path.join(__dirname, '../public/');
app.use(express.static(publicDir));

// reacting to a socket.io event - connection event (to initiate the connection with the server from client end)
io.on('connection', (socket)=>{
    console.log('Web socket connection set for new client');

    io.emit('roomList', getRooms());

    socket.on('room', (userDetails, acknowledgeCallback)=>{
        const {user, error} = addUser({id: socket.id, ...userDetails});

        if (error) return acknowledgeCallback(error);

        socket.join(user.room);
        io.emit('roomList', getRooms());

        socket.emit('message', generateMessage(`Welcome in the Room ${user.username}!`))

        // when a new client sets connection to the particular room in the server, send the notification to all other connected clients of that room except the current connected client
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));

        // to pass the current users list from server to client
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        acknowledgeCallback();
    })

    socket.on('sendMessage', (messageValue, callback)=>{
        const user = getUser(socket.id);

        if (!user) return;

        const filter = new Filter();
        if (filter.isProfane(messageValue)) return callback('Foul language not acceptable!');

        io.to(user.room).emit('message', generateMessage(messageValue, user.username, socket.id));
        callback();
    })

    socket.on('sendLocation', (locationObj, callback)=>{
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage',generateLocationMessage(`https://google.com/maps?q=${locationObj.latitude},${locationObj.longitude}`, user.username, socket.id));
        callback();
    });

    // When the current connected client is disconnected from the server send the notification to al other connected clients
    socket.on('disconnect', ()=>{
        io.emit('roomList', getRooms());
        const removedUser = removeUser(socket.id);
        if (removedUser){
            io.to(removedUser.room).emit('message', generateMessage(`${removedUser.username} has left the room!`));

            // to pass the current users list from server to client
            io.to(removedUser.room).emit('roomData', {
                room: removedUser.room,
                users: getUsersInRoom(removedUser.room)
            });
            io.emit('roomList', getRooms());
        }
    });
});

server.listen(port, ()=>{
    console.log(`Server is up and running on port ${port}`);
})