/**
 * Helper monkeys for file system stuff.
 *
 * @since 1.0.0
 */

const fs = require( 'fs' );

/**
 * Check to see if a file exists.
 *
 * @link https://thewebdev.info/2022/02/26/how-to-check-if-a-file-exists-with-node-js/
 *
 * @since 1.0.0
 *
 * @param  {String} file The filename to check.
 * @return {Boolean}     True if the file exists, false otherwise.
 */
async function fileExists( file ) {
	try {
		await fs.promises.access( file, fs.constants.F_OK );
		return true;
	} catch( e ) {
		return false;
	}
}

module.exports = {
	fileExists,
};
