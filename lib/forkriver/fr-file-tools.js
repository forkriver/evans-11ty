/**
 * Helper monkeys for file system stuff.
 *
 * @since 1.0.0
 */

const fs = require( 'fs' );
const { evansDateFormat } = require( './fr-date-formatting.js' );

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

/**
 * Sorts movies in ascending order by date.
 *
 * @since 1.0.0
 *
 * @param  {Object} a A movie.
 * @param  {Object} b A movie to compare to `a`.
 * @return int        The sorting value.
 */
function sortMoviesAsc( a, b ) {
	let aEarliest = 0;
	let bEarliest = 0;
	let aShowtimeSeconds, bShowtimeSeconds;
	// Finds the earliest showtime for each movie.
	for ( const aShowtime of a.data.showtime ) {
		aShowtimeSeconds = evansDateFormat( aShowtime, 'epoch' );
		if ( 0 === aEarliest | aShowtimeSeconds < aEarliest ) {
			aEarliest = aShowtimeSeconds;
		}
	}
	for ( const bShowtime of b.data.showtime ) {
		bShowtimeSeconds = evansDateFormat( bShowtime, 'epoch' );
		if ( 0 === bEarliest || bShowtimeSeconds < bEarliest ) {
			bEarliest = bShowtimeSeconds;
		}
	}
	return aEarliest - bEarliest;
}

module.exports = {
	fileExists,
	sortMoviesAsc,
};
