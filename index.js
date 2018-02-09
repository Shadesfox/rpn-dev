const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const helmet = require('helmet');
const cookie_parser = require('cookie-parser');
//const csurf = require('csurf');

const port=8081;
const address='localhost';

// See about modifying this one to not skip caching
app.use(helmet());
app.use(cookie_parser());
//app.use(csurf({cookie:true}));

require('./app_routes.js')(app);

io.on('connection', function(socket){
    console.log('a user connected');
    require('./rpn_chat.js')(socket,io);
});

server.listen(port, address,function(){
    console.log('listening on ' + address + ":" + port);
});
