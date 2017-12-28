module.exports = function(socket,io) {
    socket.on('disconnect', function(){
	console.log('user disconnected');
    });
    socket.on('chat message', function(msg){
	console.log('message: ' + msg);
	io.emit('chat message', msg);
    });
};
