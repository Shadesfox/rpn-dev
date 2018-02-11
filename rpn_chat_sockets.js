module.exports = function(socket,io) {
    socket.on('disconnect', function(){
	console.log('user disconnected');
    });
    socket.on('chat message', function(msg){
	console.log('user: ' + msg.user + ' message: ' + msg.msg);
	io.emit('chat message', msg);
    });
};
