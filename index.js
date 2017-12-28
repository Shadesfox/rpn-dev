const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const passwd_module = require('secure-password')

const pg = require('pg');
const connection_string = process.env.DATABASE_URL || 'postgres:///rpn';

const port=8081;
const address='localhost';

app.get('/', function(req, res){
    res.sendFile(__dirname + '/client.html');
});

app.get('/new_user', function(req, res){
    res.sendFile(__dirname + '/create_user.html');
});

app.get('/login', function(req, res){
    res.sendFile(__dirname + '/login.html');
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
    socket.on('user create', function(msg){
	console.log('creating new user: ' + msg.user_name);
	const user_passwd = Buffer.from(msg.password);
	const passwd_hasher = passwd_module();
	passwd_hasher.hash(user_passwd, function (err, hash) {
	    if (err) throw err;
	    console.log('made a hash: ' + hash);
	    const db_client = new pg.Client(connection_string);
	    db_client.connect();
	    db_client.query("INSERT INTO rpn_users(user_name,passwd_hash) VALUES ($1,$2)",
			    [msg.user_name,hash], function (err, res) {
				db_client.end();
				if (err) {
				    if (err.constraint === 'rpn_users_user_name_key') {
					console.log("User name " + msg.user_name + " is already taken.");
					// TODO: handle already taken user name.
				    } else {
					throw err;
				    }
				}
				// TODO: add follow up redirect here, or something.
			    });
	});
    });
    socket.on('user auth', function(msg){
	console.log('Logging in with user: ' + msg.user_name);
	user_passwd = Buffer.from(msg.password);
	const db_client = new pg.Client(connection_string);
	const passwd_hasher = passwd_module();
	db_client.connect();
	db_client.query("SELECT passwd_hash FROM rpn_users WHERE user_name = ($1)",
			[msg.user_name], function (err, res) {
			    db_client.end();
			    if (err) throw err;
			    if (res.rowCount != 1) {
				if (res.rowCount > 1) {
				    console.log("More than one user named " + msg.user_name + "!");
				}
				// TODO: handle no such user
				console.log("No such user: " + msg.user_name);
				return;
			    }
			    passwd_hasher.verify(user_passwd, res.rows[0].passwd_hash, function (err, result) {
				if (err) throw err;
				if (result === passwd_module.INVALID_UNRECOGNIZED_HASH) {
				    console.log('This hash was not made with secure-password. Attempt legacy algorithm');
				    return;
				}
				if (result === passwd_module.INVALID) {
				    console.log('Imma call the cops');
				    return;
				}
				if (result === passwd_module.VALID) {
				    console.log('Yay you made it');
				    return;
				}
				if (result === passwd_module.VALID_NEEDS_REHASH) {
				    console.log('Yay you made it, wait for us to improve your safety');
				    return;
				    // TODO: rehash
				}
			    });
			});
    });
});

server.listen(port, address,function(){
    console.log('listening on ' + address + ":" + port);
});
