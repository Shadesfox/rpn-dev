var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port=8081;
var address='localhost';

app.get('/', function(req, res){
    res.sendFile(__dirname + '/client.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
	console.log('user disconnected');
    });
    socket.on('chat message', function(msg){
	console.log('message: ' + msg);
	io.emit('chat message', msg);
    });
});

server.listen(port, address,function(){
    console.log('listening on ' + address + ":" + port);
});
