const generateMessage = (text, username)=>{
    return {
        text,
        username,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (locationURL, username)=>{
    return {
        locationURL,
        username,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
};