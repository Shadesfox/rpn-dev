const body_parser = require('body-parser');
const rpn_user = require('./models/user_auth');

module.exports = function(app) {
    app.use(body_parser.urlencoded({extended: false}));
    app.use(body_parser.json({extended: true}));

    app.get('/', function(req, res){
	// TODO: Should direct to some landing page while client is it's own route
	res.sendFile(__dirname + '/client.html');
    });
        app.get('/new_user', function(req, res){
	res.sendFile(__dirname + '/create_user.html');
    });
    app.post('/new_user', function(req, res){
	console.log('req: ' + req.body.name);
	console.log('creating new user: ' + req.body.name);
	const user_name = req.body.name;
	const user_passwd = req.body.password;
	rpn_user.add_user(user_name,user_passwd,function(err) {
	    if (err == rpn_user.DUPLICATE_USER) {
		//dup user code here. Don't return here, we need that res.end()
	    } else {
		res.redirect('/login');
	    }
	    res.end();
	});
    });

    app.get('/login', function(req, res){
	res.sendFile(__dirname + '/login.html');
    });
    app.post('/login', function(req, res){
	console.log('Logging in with user: ' + req.body.name);
	rpn_user.auth_user(req.body.name,req.body.password,function(err,token){
	    if (err == rpn_user.FLAGRENT_SYSTEM_ERROR) throw err;
	    if (err == rpn_user.PASSWORD_INVALID) console.log("I'mma call the cops!");
	    if (err == rpn_user.USER_NOT_FOUND) console.log("User not in database: " + req.body.name);
	    console.log(token);
	    res.end();
	});
    });
}
