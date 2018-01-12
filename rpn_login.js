const pg = require('pg');
const connection_string = process.env.DATABASE_URL || 'postgres:///rpn';
const passwd_module = require('secure-password');
const jwt = require('jsonwebtoken');
const fs = require('fs');

module.exports = function(app) {
    app.get('/new_user', function(req, res){
	res.sendFile(__dirname + '/create_user.html');
    });
    app.post('/new_user', function(req, res){
	console.log('req: ' + req.body.name);
	console.log('creating new user: ' + req.body.name);
	const user_passwd = Buffer.from(req.body.password);
	const passwd_hasher = passwd_module();
	passwd_hasher.hash(user_passwd, function (err, hash) {
	    if (err) throw err;
	    console.log('made a hash: ' + hash);
	    const db_client = new pg.Client(connection_string);
	    db_client.connect();
	    db_client.query("INSERT INTO rpn_users(user_name,passwd_hash,credentials) VALUES ($1,$2,'{}');",
			    [req.body.name,hash], function (err, db_res) {
				db_client.end();
				if (err) {
				    if (err.constraint === 'rpn_users_user_name_key') {
					console.log("User name " + req.body.name + " is already taken.");
					// TODO: handle already taken user name.
				    } else {
					throw err;
				    }
				}
				res.redirect('/login');
				res.end();
				// TODO: add follow up redirect here, or something.
			    });
	});
    });

    app.get('/login', function(req, res){
	res.sendFile(__dirname + '/login.html');
    });
    app.post('/login', function(req, res){
	console.log('Logging in with user: ' + req.body.name);
	user_passwd = Buffer.from(req.body.password);
	const db_client = new pg.Client(connection_string);
	const passwd_hasher = passwd_module();
	db_client.connect();
	db_client.query("SELECT * FROM rpn_users WHERE user_name = ($1);",
			[req.body.name], function (err, db_res) {
			    db_client.end();
			    if (err) throw err;
			    if (db_res.rowCount != 1) {
				if (db_res.rowCount > 1) {
				    console.log("More than one user named " + msg.user_name + "!");
				}
				// TODO: handle no such user
				console.log("No such user: " + msg.user_name);
				return;
			    }
			    const user_row = db_res.rows[0];
			    passwd_hasher.verify(user_passwd, user_row.passwd_hash, function (err, result) {
				if (err) throw err;
				if (result === passwd_module.INVALID_UNRECOGNIZED_HASH) {
				    console.log('This hash was not made with secure-password. Attempt legacy algorithm');
				    return;
				}
				if (result === passwd_module.INVALID) {
				    // TODO: Indication of this error, probably a redirect.
				    console.log('Imma call the cops');
				    return;
				}
				if (result === passwd_module.VALID) {
				    console.log('Yay you made it');
				    //const cert = fs.readFileSync('secret_key');
				    // TODO: read cert from file system head of time.
				    // The const cert just lets us debug the jwt.
				    const cert = "secret";
				    const seconds = Math.floor(Date.now() / 1000);
				    var login_token = {
					"credentials" : user_row.credentials,
					"exp" : seconds + 60 * 60 * 24,
					"iat" : seconds
				    };
				    jwt.sign(login_token, cert, { algorithm: 'HS256' }, function(err, token) {
					if (err) throw err;
					console.log(token);
				    });
				    return;
				}
				if (result === passwd_module.VALID_NEEDS_REHASH) {
				    console.log('Yay you made it, wait for us to improve your safety');
				    return;
				    // TODO: rehash
				}
			    });
			    res.end();
			});
    });
}
