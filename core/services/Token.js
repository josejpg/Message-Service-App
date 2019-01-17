// Requires
const jwt = require( 'jsonwebtoken' );

// Config
const secretWord = 'DAMsecret';

/**
 * Function to generate a new token for user login.
 * @param login
 * @returns {string}
 */
const generateToken = login => {
	return jwt.sign( { login: login }, secretWord, { expiresIn: "2 hours" } );
};

/**
 * Function to generate a new toke for user.
 * @param token
 * @returns {string}
 */
const renewToken = ( token ) => {
	return jwt.sign( { login: this.validateToken( token ) }, secretWord, { expiresIn: "2 hours" } );
};

/**
 * Function to validate the token.
 * @param token
 * @returns {string}
 */
const validateToken = token => {
	try {
		return jwt.verify( token, secretWord );
	}
	catch ( e ) {
		console.log( e );
	}
};

module.exports = { generateToken, validateToken };