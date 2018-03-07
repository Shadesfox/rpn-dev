const passwd_module = require('secure-password');
const db_client = require('../controllers/db');
const user_data = require('../controllers/user_data');
const token_controller = require('../controllers/token_controller');

exports.PASSWORD_INVALID=2;
exports.FLAGRENT_SYSTEM_ERROR=3;

exports.auth_user = function(user_name, user_password, reply_cb) {
    user_data.get_user(user_name, null, function(err,user_data) {
	if (err) {
	    reply_cb(err,null);
	    return;
	}
  	const passwd_hasher = passwd_module();
        passwd_hasher.verify(Buffer.from(user_password), Buffer.from(user_data.passwd),
			     function(err, result) {
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
				     token_controller.new_token(user_data,reply_cb);
				     console.log('Pop');
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
