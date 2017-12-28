const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const port=8081;
const address='localhost';

require('./app_routes.js')(app);

io.on('connection', function(socket){
    console.log('a user connected');
    require('./rpn_chat.js')(socket,io);
    require('./rpn_login.js')(socket);
});

server.listen(port, address,function(){
    console.log('listening on ' + address + ":" + port);
});
