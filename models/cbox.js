const token_controller = require('../controllers/token_controller');
const cbox_db = require('../controllers/rpn_cbox');

exports.add_character = function(jwt_token, character_data){
    token_controller.auth_token(jwt_token, function(err,token){
	if(err) throw err;
	cbox_db.add_character(token.user_id, character_data);
    })
}

exports.get_cbox = function(jwt_token){
    token_controller.auth_token(jwt_token, function(err, token){
	if(err) throw err;
	return cbox_db.get_cbox(token.user_id);
    })
}
