const { DateTime } = require( 'luxon' );

/**
 * Formats a date.
 *
 * @since 1.0.0
 *
 * @todo Convert numeric "dates" from timestamp to a date format.
 *
 * @param  string|Date theDate The date to format.
 * @param  string      format  The desired date format.
 *                             Accepts a Luxon date format string,
 *                             'epoch' (for seconds), 'mdy', 'md', or 'year'.
 *                             Defaults to m-d-Y at h:m a.
 * @return string              The formatted date, or (on error) theDate.
 */ 
function evansDateFormat( theDate, format = '' ) {

	if ( 'Last Modified' === theDate || 'Created' === theDate ) {
		theDate = DateTime.local().toFormat( 'yyyy-MM-dd tt', { zone: "America/Winnipeg" } );
	}
	
	var myDate;
	myDate = DateTime.fromFormat( theDate, 'yyyy-MM-dd tt', { zone: "America/Winnipeg" } );
	if ( myDate.invalid ) {
		// Try ISO.
		myDate = DateTime.fromISO( theDate, { zone: "America/Winnipeg" } );
	}

    switch ( format ) {
    // Luxon date format list: https://moment.github.io/luxon/#/parsing?id=table-of-tokens
	    case 'mdy':
	    	return myDate.toFormat( 'MMM. d, yyyy' );
	    	break;
	    case 'md':
	    	return myDate.toFormat( 'MMM. d' );
	    	break;
	    case 'year':
	    	return myDate.toFormat( 'yyyy' );
	    	break;
	    case 'epoch':
	    	return myDate.toSeconds();
	    	break;
	    case '':
	    	return myDate.toFormat( 'EEE., MMM. d, yyyy' ) + ' at ' + myDate.toFormat('t');
	    	break;
	    default:
	    	return myDate.toFormat( format );
    }

}

/**
 * Determines if a date is later than today.
 *
 * Used in finding the next {n} movies.
 *
 * @since 1.0.0
 *
 * @param  string|string[] showtime The date(s) to check.
 * @return boolean                  Whether the date is later than now().
 */
function laterThanToday( showtime ) {
	var inTheFuture = false;
	const now = parseInt( DateTime.now().toSeconds() );
	if ( 'string' === typeof showtime ) {
		var theShowtime = showtime;
		showtime = [];
		showtime.push( theShowtime );
	}
	for ( const s of showtime ) {
		const check = parseInt( DateTime.fromFormat( s, 'yyyy-MM-dd tt', { zone: "America/Winnipeg" } ).toSeconds() );
		if ( check > now ) {
			inTheFuture = true;
		}
	}
	return inTheFuture;
}

/**
 * Generates the date range for a movie.
 *
 * @since 1.0.0
 *
 * @param  string[] showtimes    The showtimes.
 * @param  boolean  onlyUpcoming Consider only upcoming showtimes in the range.
 * @return string                The range as a string.
 */
function evansDateRange( showtimes, onlyUpcoming = false ) {
	if ( onlyUpcoming ) {
		var upcomingDates = [];
		for ( const s of showtimes ) {
			if ( laterThanToday( s ) ) {
				upcomingDates.push( s );
			}
		}
		if ( 0 === upcomingDates.length ) {
			return '';
		}
		showtimes = upcomingDates;
	}
	// Sort the showtimes.
	showtimes.sort( function( a, b ) {
		return evansDateFormat( a, 'epoch' ) - evansDateFormat( b, 'epoch' );
	});
	var startDate, endDate;
	startDate = showtimes[0];
	endDate   = showtimes[ showtimes.length - 1 ];
	if ( endDate === startDate ) {
		return evansDateFormat( startDate, 'mdy' );
	}

	// Checks the years.
	if ( evansDateFormat( startDate, 'year' ) === evansDateFormat( endDate, 'year' ) ) {
		return evansDateFormat( startDate, 'md' ) + ' – ' + evansDateFormat( endDate, 'mdy' );	
	}

	return evansDateFormat( startDate, 'mdy' ) + ' – ' + evansDateFormat( endDate, 'mdy' );	

}

function getNextSessionMonth() {
	const currentMonth = DateTime.local( { zone: "America/Winnipeg" } ).month;
	if ( currentMonth > 9 ) {
		return 'January';
	}
	return 'September';
}

module.exports = {
	evansDateFormat,
	laterThanToday,
	evansDateRange,
	getNextSessionMonth,
}
