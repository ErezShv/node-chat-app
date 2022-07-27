const socket = io()

const $messageForm = document.querySelector('#message-from')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#mesasges')

const messageTempleat = document.querySelector('#message-template').innerHTML
const locationMessageTempleat = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidbar-template').innerHTML


// options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageheight = $newMessage.offsetHeight + newMessageMargin

    // Visibale height
    const visiableHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // how far have i scrolled?
    const scrollOfffset = $messages.scrollTop + visiableHeight

    if (containerHeight - newMessageheight <= scrollOfffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(`got message: ${message}`)
    const html = Mustache.render(messageTempleat, {
        username: message.username,
        message: message.text,
        createAt: moment(message.createAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('locationMessage', (message) => {
    console.log(`locationMessagez, `, message)
    const html = Mustache.render(locationMessageTempleat, {
        username: message.username,
        url: message.text,
        createAt: moment(message.createAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ( {room, users} ) => {
    console.log(`roomData, ${room}, ${users}`)
    console.log(room)
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector(`#sidebar`).innerHTML = html
})

document.querySelector('#message-from').addEventListener('submit', (e) => {
    console.log('clicked')
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    //disable
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (msg, error) => {
        //eanblae
        $messageFormButton.removeAttribute('disabled','disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('The message was deliverd!', msg)
    })
})

$sendLocationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled','disabled')
            console.log('location ack')
        })
    })
})

socket.emit('join', {username, room}, (error) => {
       
    if (error) {
        console.log('join error') 
        alert(error)
    }
})