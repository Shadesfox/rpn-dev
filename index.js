const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const helmet = require('helmet');
const cookie_parser = require('cookie-parser');
const body_parser = require('body-parser');
const csurf = require('csurf');
const cons = require('consolidate');

const port=8081;
const address='localhost';

app.engine('dust', cons.dust);
app.set('view engine', 'dust');
app.set('views', __dirname + '/views/templates');

// See about modifying this one to not skip caching
// ORDER MATTERS! Middleware is called in this order.
app.use(helmet());
app.use(cookie_parser());
app.use(body_parser.urlencoded({extended: false}));
app.use(body_parser.json({extended: true}));
app.use(csurf({cookie:true}));
app.use(express.static('static'));

require('./app_routes.js')(app);

io.on('connection', function(socket){
    console.log('a user connected');
    require('./rpn_chat_sockets.js')(socket,io);
});

server.listen(port, address,function(){
    console.log('listening on ' + address + ":" + port);
});
