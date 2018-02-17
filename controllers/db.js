const {Pool, Client} = require('pg');

const db_pool = new Pool({
    host:'localhost',
    database:'rpn'
});

exports.query = function(query_string, params, cb) {
    db_pool.query(query_string, params, function(err, res) {
	cb(err, res);
    });
}
    
