// Requires
const db = require( 'mongoose' );

db.Promise = global.Promise;
db.connect( 'mongodb://localhost:27017/message', {
	useCreateIndex: true,
	useNewUrlParser: true
} );


module.exports = db;