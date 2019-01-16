const jwt = require( 'jsonwebtoken' );
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const db = require( 'mongoose' );
const secretWord = 'DAMsecret';

/**
 * Preparing DB
 */
db.Promise = global.Promise;
db.connect( 'mongodb://localhost:27017/message' );
let userSchema = new db.Schema( {
	name: {
		type: String,
		required: true,
		minlength: 1,
		match: /\w+/,
		unique: true
	},
	password: {
		type: String,
		required: true,
		minlength: 4
	},
	image: {
		type: String,
		required: true
	}
} );
let messageSchema = new db.Schema( {
	from: {
		type: db.Schema.Types.ObjectId,
		ref: 'user',
		required: true
	},
	to: {
		type: db.Schema.Types.ObjectId,
		ref: 'user',
		required: true
	},
	message: {
		type: String,
		required: true,
		trim: true,
		minlength: 4
	},
	image: String,
	sent: {
		type: String,
		required: true,
		trim: true,
		minlength: 10
	}
} );
let User = db.model( 'user', userSchema );
let Message = db.model( 'message', messageSchema );

/**
 * Token
 */
const generateToken = login => {
	return jwt.sign( { login: login }, secretWord, { expiresIn: "2 hours" } );
};
const validateToken = token => {
	try {
		return jwt.verify( token, secretWord );
	}
	catch ( e ) {
		console.log( e );
	}
};

/**
 * API
 */
let app = express();
app.use( bodyParser.json() );

app.get( '/test', ( req, res ) => {
	res.send( 'Hello from test URI' );
} );

/**
 * POST: Login.
 * Request: { "name": String, "password": String }
 * Response: { "ok": Boolean, "token": String, "name": String, "image": String }
 * Response Error: { "ok": Boolean, "error": String }
 *
 * This service will receive a JSON object containing a user name and password.
 * It will check if a user with that name and password (encrypted) exists in the database, and
 * in case the request is successful, it will return the authentication token, and also the name
 * and the avatar image of the user.
 * If there’s an error in the login process, this service must return the following JSON
 */
app.post( '/login', ( req, res ) => {

} );

/**
 * POST: Register.
 * Request: { "name": String, "password": String, "image": String }
 * Response: { "ok": Boolean }
 * Response Error: { "ok": Boolean, "error": String }
 *
 * This service will receive a user name and a password, and both fields must be saved in
 * the database. Also an avatar image for that user must be provided. From the client side,
 * you must send a JPEG image (you don’t have to check that) encoded in base64.
 * After receiving that request, you must create a file containing the picture, to generate a
 * URL of the image, which will be referenced and displayed on the client side. Also keep in
 * mind that you should generate a unique name for each file.
 */
app.post( '/register', ( req, res ) => {

} );

/**
 * PUT: Users.
 * Response: { "ok": Boolean }
 * Response Error: { "ok": Boolean, "error": String }
 *
 * This service will update the avatar image of a user.
 * After receiving the image, remember that you must generate a new file so that the string
 * containing the path is also updated in the database.
 */
app.put( '/users/:_id', ( req, res ) => {

} );

/**
 * GET: Users.
 * Response: { "ok": Boolean, "usesr": Array<User> }
 * User: { "_id": String, "name": String, "password": String, "image": String, "__v": Number }
 *
 * It will return an array with all the registered users which are stored in the database.
 */
app.get( '/users', ( req, res ) => {

} );

/**
 * POST: Messages.
 * Request: { "message": String, "image": String, "sent": Date }
 * Response: { "ok": Boolean, "message": Message }
 * Message: { "_id": String, "from": User._id, "to": User._id, "message": String, "sent": Date, "__v": Number }
 * Response Error: { "ok": Boolean, "error": String }
 *
 * This service sends a new message to a user. The user sending the message is the one
 * that is logged (you can get that information from the token) and the destination user id is
 * received as a parameter. The JSON data you must send to the service is the text, image
 * (optional) and the current date when the message is sent.
 */
app.post( '/messages/:toUserId', ( req, res ) => {

} );

/**
 * DELETE: Messages.
 * Request: { "message": String, "image": String, "sent": Date }
 * Response: { "ok": Boolean }
 * Response Error: { "ok": Boolean, "error": String }
 *
 * This service deletes the message matching the id received.
 */
app.post( '/messages/:id', ( req, res ) => {

} );

/**
 * GET: Messages.
 * Response: { "ok": Boolean, "messages": Array<Message> }
 * Message: { "_id": String, "from": User._id, "to": User._id, "message": String, "sent": Date, "__v": Number }
 * Response Error: { "ok": Boolean, "error": String }
 *
 * This service returns all messages that were sent to the user that is performing the request.
 */
app.get( '/messages', ( req, res ) => {

} );

app.listen( 8080 );