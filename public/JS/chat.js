// to initiate the connection with the server from Client side
const socket = io();

// Elements
const messageForm = document.getElementById('messageForm');
const messageInput = messageForm.querySelector('input[name=message]');
const sendMessageButton = messageForm.querySelector('button');
const shareLocationBtn = document.getElementById('shareLocationBtn');
const messagesContainer = document.getElementById('messages-container');
const sidebar = document.getElementById('sidebar');
const collapsableSidebar = document.getElementById('collapsable-sidebar');

// Templates
const leftMessageTemplate = document.getElementById('left-message-template').innerHTML;
const rightMessageTemplate = document.getElementById('right-message-template').innerHTML;
const welcomeLeaveMessageTemplate = document.getElementById('welcome-leave-message-template').innerHTML;
const leftLocationMessageTemplate = document.getElementById('left-location-message-template').innerHTML;
const rightLocationMessageTemplate = document.getElementById('right-location-message-template').innerHTML;
const roomUsersTemplate = document.getElementById('room-users-template').innerHTML;
const collapsableRoomUsersTemplate = document.getElementById('collapsable-room-users-template').innerHTML;

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

// autoscroll function
const autoscroll = ()=>{
    // new message element
    const newMessageElem = messagesContainer.lastElementChild;
    
    // new message element hieght with it's margin
    const newMessageStyle = getComputedStyle(newMessageElem);
    const newMessageMarginBottom = parseInt(newMessageStyle.marginBottom);
    const newMessageHieght = newMessageElem.offsetHeight + newMessageMarginBottom;

    // visible height
    const visibleHight = messagesContainer.offsetHeight;

    // actual height of the messagesContainer
    const containerHeight = messagesContainer.scrollHeight;

    // how far have I scrolled
    const scrollOffset = messagesContainer.scrollTop + visibleHight;

    if (containerHeight - newMessageHieght <= scrollOffset){
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

socket.on('message', (message)=>{
    const currentClientId = socket.id;
    console.log(message);

    let html;

    // to render dynamic message html in the targeted element
    if (message.username){
        if (currentClientId === message.clientId){
            html = Mustache.render(rightMessageTemplate, {
                message: message.text,
                username: message.username,
                createdAt: moment(message.createdAt).format('h:mm a')
            });
        }
        else{
            html = Mustache.render(leftMessageTemplate, {
                message: message.text,
                username: message.username,
                createdAt: moment(message.createdAt).format('h:mm a')
            });
        }
    }
    else{
        html = Mustache.render(welcomeLeaveMessageTemplate, {
            message: message.text,
            createdAt: moment(message.createdAt).format('MMMM D, YYYY - h:mm a')
        });
    }
    messagesContainer.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', (location)=>{
    const currentClientId = socket.id;
    console.log(location);

    let html;

    if (currentClientId === location.clientId){
        html = Mustache.render(rightLocationMessageTemplate, {
            locationURL: location.locationURL,
            username: location.username,
            createdAt: moment(location.createdAt).format('h:mm a')
        });
    }
    else{
        html = Mustache.render(leftLocationMessageTemplate, {
            locationURL: location.locationURL,
            username: location.username,
            createdAt: moment(location.createdAt).format('h:mm a')
        });
    }
    messagesContainer.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({room, users})=>{
    const collapsableHtml = Mustache.render(collapsableRoomUsersTemplate, {
        room,
        users
    });

    const html = Mustache.render(roomUsersTemplate, {
        room,
        users
    });

    collapsableSidebar.innerHTML = collapsableHtml;
    sidebar.innerHTML = html;
});

messageForm.addEventListener('submit',(event)=>{
    // disable
    sendMessageButton.setAttribute('disabled', 'disabled');

    event.preventDefault();
    const message = event.target.elements.message.value;
    socket.emit('sendMessage', message, (error)=>{
        // enable
        sendMessageButton.removeAttribute('disabled');
        messageInput.value = '';
        messageInput.focus();

        console.log(error?error:'Message delivered successfully');
    });
});

shareLocationBtn.addEventListener('click', ()=>{
    if (!navigator.geolocation) return alert('Geolocation API is not supported by your browser!');

    // disable
    shareLocationBtn.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position)=>{
        const locationObj = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        socket.emit('sendLocation', locationObj, ()=>{
            // enable
            shareLocationBtn.removeAttribute('disabled');

            console.log('Location Shared!');
        });
    });
});

// to pass the user name and room data to the server when the client setup the connection with the server
socket.emit('room', {username, room}, (error)=>{
    if (error) {
        alert(error);
        location.href = '/';
    }
});