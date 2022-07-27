
const generateMessage = (username, text) => {
    return {
        username,
        text,
        createAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, text) => {
    return {
        username,
        text,
        createAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}