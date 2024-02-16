var express = require("express")
var fs = require("fs")
const path = require('path')
var https = require('https')
var socketIO = require('socket.io')

var app = express()
const server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
}, app)
// var server = http.Server(app)
var io = socketIO(server)


app.get('/', function (req, res) {
    // res.sendFile('D:\\multi-room\\room3.html')
    res.sendFile(path.join(__dirname, "room3.html"))
});

var rooms = {}




io.on('connection', function (socket) {
    const socketID = socket.id
    
    socket.on("room_name", (room_name) => {
        socket.join(room_name)

        if (!(room_name in rooms)) {
            rooms[room_name] = socketID
        }
        else{
            io.to(rooms[room_name]).emit("sync", socketID)
        }
    })


    socket.on("inner", (editor_content,socketID) => {
        socket.emit("prev",editor_content.ops)
        io.to(socketID).emit("prev", editor_content.ops)
    })


    socket.on("diff-client", (delta, room_name_value) => {
        socket.to(room_name_value).emit("diff-broadcast", delta);
    })
})

server.listen(3000, function () {
    console.log('listening on *:3000');
});