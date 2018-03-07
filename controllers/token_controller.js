const jwt = require('jsonwebtoken');
//TODO Real secret key
const auth_key = "secret";
const sign_key = "secret";

//TODO: set this up so it can be an app route

exports.auth_token = function(user_token, user_cb) {
    const verified_token = jwt.verify(jwt_token, auth_key, user_cb);
}

exports.new_token = function(user_data, user_cb) {
    //const cert = fs.readFileSync('secret_key');
    // TODO: read cert from file system head of time.
    // The const cert just lets us debug the jwt.
    const seconds = Math.floor(Date.now() / 1000);
    const login_token = {
	"user_name" : user_data.user_name,
	"user_id" : user_data.user_id,
	"iss" : "https://rpnetwork.org",
	"credentials" : user_data.credentials,
	"exp" : seconds + 60 * 60 * 24,
	"iat" : seconds
    };
    jwt.sign(login_token, sign_key, { algorithm: 'HS256' }, function(err, token) {
	console.log("signed");
	if (err) throw err;
	console.log("PREP FOR REPLY!");
	user_cb(null,token);
	console.log("Done with reply");
    });
}
