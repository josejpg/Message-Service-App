/**
 * @author Jose J. Pardines Garcia
 */

// Requires
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const fs = require( 'fs' );
const url = require( 'url' );

// Config
const app = express();
app.use( bodyParser.json( {
    limit: '50mb',
    extended: true,
    type:'application/json'
} ) );
app.use( bodyParser.urlencoded( {
    limit: '50mb',
    extended: true,
    parameterLimit: 50000,
    type:'application/x-www-form-urlencoding'
} ) );
const port = process.env.PORT || 8081;

// Routes
const routesUser = require( './core/routes/User' );
const routesMessage = require( './core/routes/Message' );

app.use( '/api/users', routesUser );
app.use( '/api/messages', routesMessage );
app.use( '/images/', (req,res) => {
    const pathname = url.parse( req.url ).pathname;
    res.writeHead( 200, { 'Content-Type':  "image/jpg" } );
    res.end( fs.readFileSync( './images/' +pathname ), 'binary' );
} );

app.listen( port );