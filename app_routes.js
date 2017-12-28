module.exports = function(app) {
    app.get('/', function(req, res){
	res.sendFile(__dirname + '/client.html');
    });
    app.get('/new_user', function(req, res){
	res.sendFile(__dirname + '/create_user.html');
    });
    app.get('/login', function(req, res){
	res.sendFile(__dirname + '/login.html');
    });
}
