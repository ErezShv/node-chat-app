const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUsersInRoom, getUser } = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection',(socket) => {
    console.log('New websocket connection')
    socket.on('join', ({ username, room}, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room})

        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(room).emit('message', generateMessage(`${user.username} has joined!`))
        console.log(`join roomData ${user.room}, ${ getUsersInRoom(user.room)}`)
        io.to(user.room).emit(`roomData`, {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        // console.log('get message: ', message)
        const user = getUser(socket.id)
        // console.log('get message user: ', user)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback('deliverd')
    })

    socket.on('sendLocation', (coords, callback) => {
        // console.log("sendLocation")
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', (message) => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
            io.to(user.room).emit(`roomData`, {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})

