module.exports = function(socket,io) {
    socket.on('disconnect', function(){
	console.log('user disconnected');
    });
    socket.on('chat message', function(msg){
	console.log('user: ' + msg.user + ' message: ' + msg.msg);
	const new_msg = {
	    toon_name : msg.user,
	    toon_avatar : "",
	    toon_header : "",
	    toon_chat_message : msg.msg
	};
	io.emit('chat message', new_msg);
    });
};
