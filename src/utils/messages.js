const generateMessage = (text, username, clientId)=>{
    return {
        clientId,
        text,
        username,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (locationURL, username, clientId)=>{
    return {
        clientId,
        locationURL,
        username,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
};