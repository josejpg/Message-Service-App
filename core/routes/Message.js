// Requires
const express = require( 'express' );
const bodyParser = require( 'body-parser' );

// Models
const User = require( '../models/User' );
const Message = require( '../models/Message' );

// Token
const Token = require( '../services/Token' );

// Config
const app = express();
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
const router = express.Router();

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
router.post( '/:toUserId', ( req, res ) => {

	let message = new Message();
	message.from = req.body.from;
	message.to = req.body.to;
	message.message = req.body.message;
	message.image = req.body.image;
	message.sent = req.body.sent;

	message.save( ( err ) => {
		if ( err ) {
			res.json( { ok: false, message: err } );
		}

		res.json( { ok: true } );
	} );

} );

/**
 * DELETE: Messages.
 * Request: { "message": String, "image": String, "sent": Date }
 * Response: { "ok": Boolean }
 * Response Error: { "ok": Boolean, "error": String }
 *
 * This service deletes the message matching the id received.
 */
router.delete( '/:id', ( req, res ) => {

} );

/**
 * GET: Messages.
 * Response: { "ok": Boolean, "messages": Array<Message> }
 * Message: { "_id": String, "from": User._id, "to": User._id, "message": String, "sent": Date, "__v": Number }
 * Response Error: { "ok": Boolean, "error": String }
 *
 * This service returns all messages that were sent to the user that is performing the request.
 */
router.get( '/', ( req, res ) => {

} );

module.exports = router;