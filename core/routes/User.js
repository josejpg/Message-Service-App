// Requires
const express = require( 'express' );
const bodyParser = require( 'body-parser' );

//Utils
const md5 = require( '../utils/encryptMD5' );


// Models
const User = require( '../models/User' );

// Token
const Token = require( '../services/Token' );

// Config
const app = express();
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
const router = express.Router();

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
router.post( '/login', ( req, res ) => {

	let user = new User();
	user.name = req.body.name;
	user.password = md5.encryptText( req.body.password );

	User
		.find( { name: user.name, password: user.password } )
		.then( dataUsers => {

			if ( dataUsers && dataUsers.length > 0 ) {

				const dataUser = dataUsers[ 0 ];
				if ( md5.compareHash( req.body.password, dataUser.password ) ) {

					let message = {
						ok: true,
						token: Token.generateToken( dataUser.name ),
						name: dataUser.name,
						image: dataUser.image,
					};
					res.send( message );

				} else {

					let data = { ok: false, message: "User or password is invalid" };
					res.send( data );

				}

			} else {

				let data = { ok: false, message: "User or password is invalid" };
				res.send( data );

			}

		} ).catch( err => {

		let data = { ok: false, message: "User or password incorrect" };
		console.log( err );
		res.send( data );

	} );

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
router.post( '/register', ( req, res ) => {

	let user = new User();
	user.name = req.body.name;
	user.password = md5.encryptText( req.body.password );
	user.image = req.body.image;

	user.save().then( () => {

		let message = { ok: true };
		res.status( 200 ).send( message );

	} ).catch( err => {

		let data = { ok: false, message: "User couldn't be registered" };
		console.log( err );
		res.status( 400 ).send( data );

	} );

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
router.put( '/:_id', ( req, res ) => {

	const newDataUser = new User();
	newDataUser.name = req.body.name;
	newDataUser.password = req.body.password;
	newDataUser.image = req.body.image;

	User.findById( req.params._id ).then( dataUser => {

		// Generate a new “.jpg” file where the new avatar image will be saved
		newDataUser.save().then( () => {

			let data = { ok: true };
			res.status( 200 ).send( data );

		} ).catch( err => {

			let data = { ok: false, message: "Error while updating. Try again in a few minutes." };
			console.log( err );
			res.status( 500 ).send( data );

		} );

	} ).catch( err => {

		let data = { ok: false, message: "User not found" };
		console.log( err );
		res.status( 404 ).send( data );

	} );


} );

/**
 * GET: Users.
 * Response: { "ok": Boolean, "users": Array<User> }
 * User: { "_id": String, "name": String, "password": String, "image": String, "__v": Number }
 *
 * It will return an array with all the registered users which are stored in the database.
 */
router.get( '/', ( req, res ) => {

	const token = req.headers[ 'authorization' ];
	const dataToken = Token.validateToken( token );

	if ( dataToken ) {

		console.log( dataToken );
		if ( dataToken.exp < new Date().getTime() ) {
			User
				.find()
				.then( dataUsers => {

					let message = {
						ok: true,
						users: dataUsers
					};
					res.status( 200 ).send( message );

				} ).catch( err => {

				let data = { ok: false, message: "Error recovering users. Try again in a few minutes" };
				console.log( err );
				res.status( 500 ).send( data );

			} );
		} else {

			let data = { ok: false, message: "Token expired" };
			res.status( 403 ).send( data );

		}

	} else {

		let data = { ok: false, message: "Token is not correct" };
		res.status( 403 ).send( data );

	}

} );

module.exports = router;