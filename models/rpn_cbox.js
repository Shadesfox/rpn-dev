const db_client = require('../controllers/db');
const jwt = require('jsonwebtoken');

exports.get_cbox = function(user_id) {
    var cbox_list = [];
    db_client.query("SELECT * FROM rpn_cbox WHERE owner = $1;", [user_id],
		    function(err, db_res){
			if(err) throw err;
			for(idx=0; idx < db_res.rowCount; idx++) {
			    var cbox_entry = {
				character_name : db_res.rows[idx].character_name,
				image_url : db_res.rows[idx].image_url,
				character_bio : db_res.rows[idx].character_bio,
				character_header : db_res.rows[idx].character_header,
				style_sheet_url : db_res.rows[idx].style_sheet_url
			    }
			    cbox_list.push(cbox_entry);
			}
		    });
    return cbox_list;
}

exports._add_character = function(user_id, character_data){
    db_client.query("INSERT INTO rpn_cbox(owner,character_name) VALUES ($1,$2);",
		    [user_id, character_data.character_name], function(err, db_res){
			if(err) throw err;
			console.log("Added character " + character_data.character_name);
		    });
}

exports.add_character = function(jwt_token, character_data){
    const verified_token = jwt.verify(jwt_token, "secret", function(err,token){
	if(err) throw err;
	exports._add_character(token.user_id, character_data);
    })
}
