// Requires
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const fs = require( 'fs' );
const moment = require( 'moment' );

//Utils
const base64 = require( '../utils/encryptBase64' );
const myFS = require( '../utils/files' );


// Models
const User = require( '../models/User' );

// Token
const Token = require( '../services/Token' );

// Config
const app = express();
app.use( bodyParser.json( { limit: '50mb', extended: true } ) );
app.use( bodyParser.urlencoded( { limit: '50mb', extended: true } ) );
const router = express.Router();
const baseImagePath = './images/user';

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
	user.password = base64.encryptText( req.body.password );

	User
		.find( { name: user.name, password: user.password } )
		.then( dataUsers => {

			if ( dataUsers && dataUsers.length > 0 ) {

				const dataUser = dataUsers[ 0 ];
				if ( base64.compareHash( req.body.password, dataUser.password ) ) {

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

	const user = new User();
	const d = new moment();
	let imagePath = `${ baseImagePath }/${ d.format( 'YYYY/MM/DD' ) }`;
	myFS.mkdir( imagePath );
	user.name = req.body.name;
	user.password = base64.encryptText( req.body.password );
	user.image = 'empty';

	user.save().then( ( result ) => {

		// First save user data, and later save de image with de _id as a image's name.
		imagePath += `/${ result._id }.jpg`;
		fs.writeFileSync( imagePath, Buffer.from( req.body.image, 'base64' ) );
		user.image = imagePath;

		user.save().then( () => {

			let message = { ok: true };
			res.status( 200 ).send( message );

		} ).catch( err => {

			let data = { ok: false, message: "Image couldn't be registered" };
			console.log( req.body );
			console.log( err );
			res.status( 400 ).send( data );

		} );

	} ).catch( err => {

		let data = { ok: false, message: "User couldn't be registered" };
		console.log( req.body );
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

	const token = req.headers[ 'authorization' ];
	const dataToken = Token.validateToken( token );

	if ( dataToken ) {

		if ( dataToken.exp < new Date().getTime() ) {

			const newDataUser = new User();
			const d = new moment();
			let imagePath = `${ baseImagePath }/${ d.format( 'YYYY/MM/DD' ) }`;
			myFS.mkdir( imagePath );
			newDataUser.name = req.body.name;
			newDataUser.password = base64.encryptText( req.body.password );
			imagePath += `/${ req.params._id }.jpg`;
			fs.writeFileSync( imagePath, Buffer.from( req.body.image, 'base64' ) );

			newDataUser.image = imagePath;

			User.findById( req.params._id ).then( oldDataUser => {

				// Remove older image and save new data
				myFS.rmdir( oldDataUser.image );
				newDataUser.update( { "_id": req.params._id } ).then( () => {

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

		} else {

			let data = { ok: false, message: "Token expired" };
			res.status( 403 ).send( data );

		}

	} else {

		let data = { ok: false, message: "Token is not correct" };
		res.status( 403 ).send( data );

	}

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