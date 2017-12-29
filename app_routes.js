const body_parser = require('body-parser');

module.exports = function(app) {
    app.use(body_parser.urlencoded({extended: false}));
    app.use(body_parser.json({extended: true}));

    app.get('/', function(req, res){
	// TODO: Should direct to some landing page while client is it's own route
	res.sendFile(__dirname + '/client.html');
    });
}
