/**
 * @author Jose J. Pardines Garcia
 */

// Requires
const express = require( 'express' );
const bodyParser = require( 'body-parser' );

// Config
const app = express();
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
const port = process.env.PORT || 8081;

// Routes
const routesUser = require( './core/routes/User' );
const routesMessage = require( './core/routes/Message' );

app.use( '/api/users', routesUser );
app.use( '/api/messages', routesMessage );
app.listen( port );