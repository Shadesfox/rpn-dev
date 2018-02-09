const pg = require('pg');
const connection_string = process.env.DATABASE_URL || 'postgres:///rpn';
const passwd_module = require('secure-password');
const jwt = require('jsonwebtoken');
const fs = require('fs');

exports.USER_NOT_FOUND=1;
exports.PASSWORD_INVALID=2;
exports.FLAGRENT_SYSTEM_ERROR=3;
exports.USER_NAME_TAKEN=4;

exports.add_user = function(user_name, user_password, reply_cb) {
    const passwd_hasher = passwd_module();
    passwd_hasher.hash(Buffer.from(user_password), function (err, hash) {
	if (err) throw err;
	console.log('made a hash: ' + hash);
	const db_client = new pg.Client(connection_string);
	db_client.connect();
	db_client.query("INSERT INTO rpn_users(user_name,passwd_hash,credentials) VALUES ($1,$2,'{}');",
			[user_name,hash], function (err, db_res) {
			    db_client.end();
			    if (err) {
				if (err.constraint === 'rpn_users_user_name_key') {
				    console.log("User name " + req.body.name + " is already taken.");
				    reply_cb(exports.USER_NAME_TAKEN);
				    return;
				} else {
				    throw err;
				}
			    }
			    reply_cb(null);
			});
    });
}

exports.auth_user = function(user_name, user_password, reply_cb) {
    const db_client = new pg.Client(connection_string);
    db_client.connect();
    db_client.query("SELECT * FROM rpn_users WHERE user_name = ($1);",
		    [user_name], function (err, db_res) {
			db_client.end();
			if (err) throw err;
			if (db_res.rowCount != 1) {
			    if (db_res.rowCount > 1) {
				console.log("More than one user named " + user_name + "!");
			    }
			    reply_cb(exports.USER_NOT_FOUND,null);
			    return;
			}
			const user_row = db_res.rows[0];
  		    	const passwd_hasher = passwd_module();
			passwd_hasher.verify(Buffer.from(user_password), user_row.passwd_hash, function(err, result) {
			    if (err) throw err;
			    if (result === passwd_module.INVALID_UNRECOGNIZED_HASH) {
				reply_cb(exports.FLAGRENT_SYSTEM_ERROR,null);
				return;
			    }
			    if (result === passwd_module.INVALID) {
				reply_cb(exports.PASSWORD_INVALID,null);
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
				    "user_name" : user_row.user_name,
				    "iss" : "https://rpnetwork.org",
				    "credentials" : user_row.credentials,
				    "exp" : seconds + 60 * 60 * 24,
				    "iat" : seconds
				};
				jwt.sign(login_token, cert, { algorithm: 'HS256' }, function(err, token) {
				    if (err) throw err;
				    reply_cb(null,token);
				});
				return;
			    }
			    if (result === passwd_module.VALID_NEEDS_REHASH) {
				console.log('Yay you made it, wait for us to improve your safety');
				return;
				// TODO: rehash
			    }
			});
		    });
}
