const fs = require( 'fs' );

/**
 * If path dosn't exist make it
 * @param path
 * @returns {boolean}
 */
const mkdir = ( path ) => {
	if ( !fs.existsSync( path ) ) {
		const aPath = path.split( '/' );
		path = '';
		aPath.forEach( newPath => {

			if( newPath !== '.' ) {
				path += `/${ newPath }`;
				if ( !fs.existsSync( path ) ) {
					fs.mkdirSync( path, 766, ( err ) => {
						if ( err ) {
							console.log( err );
							return false;
						}
						return true;
					} );
				}
			}else {
				path += newPath;
			}
		});
	}
};

/**
 * Remove a dir or a file if exists
 * @param path
 */
const rmdir = ( path ) => {
	if ( !fs.existsSync( path ) ) {
		fs.unlinkSync( path )
			.then( (e) = {} )
			.catch( err => console.log( err ) );
	}
};

/**
 * Return true if path exists and false if not
 * @param path
 * @returns {boolean}
 */
const existsDir = ( path ) => {
	return fs.existsSync( path );
};

module.exports = { mkdir, rmdir, existsDir };