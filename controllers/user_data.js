const passwd_module = require('secure-password');
const token_controller = require('./token_controller');
const cbox_db = require('./rpn_cbox');
const db_client = require('./db');

exports.USER_NOT_FOUND=1;
exports.USER_NAME_TAKEN=4;

exports.add_user = function(user_name, user_password, reply_cb) {
    const passwd_hasher = passwd_module();
    passwd_hasher.hash(Buffer.from(user_password), function (err, hash) {
	if (err) throw err;
	console.log('made a hash: ' + hash);
	db_client.query("INSERT INTO rpn_users(user_name,passwd_hash,credentials) VALUES ($1,$2,'{}') RETURNING user_id;",
			[user_name,hash], function (err, db_res) {
			    if (err) {
				if (err.constraint === 'rpn_users_user_name_key') {
				    console.log("User name " + user_name + " is already taken.");
				    reply_cb(exports.USER_NAME_TAKEN);
				    return;
				} else {
				    throw err;
				}
			    }
			    const user_id = db_res.rows[0].user_id;
			    var credentials = {
				privileges : {
				    chat : true
				} 
			    };
			    reply_cb(null, credentials);
			    cbox_db.add_character(user_id,{character_name:user_name});
			});
    });
}

exports.get_user = function(user_name, user_password, user_cb) {
    db_client.query("SELECT * FROM rpn_users WHERE user_name = ($1);",
		    [user_name], function (err, db_res) {
			if (err) throw err;
			if (db_res.rowCount != 1) {
			    if (db_res.rowCount > 1) {
				console.log("More than one user named " + user_name + "!");
			    }
			    user_cb(exports.USER_NOT_FOUND,null);
			    return;
			}
			const user_row = db_res.rows[0];
			const user_data = {
			    user_id : user_row.user_id,
			    user_name : user_row.user_name,
			    passwd : user_row.passwd_hash,
			    credentials : user_row.credentials
			};
			user_cb(err,user_data);
		    });
}
