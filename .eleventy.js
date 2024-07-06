// Requirements.
const lodash       = require( 'lodash' );
const { DateTime } = require( 'luxon' );
const Image        = require("@11ty/eleventy-img");
const fs           = require( 'fs' );
const embedYouTube = require('eleventy-plugin-youtube-embed');

// @todo - Showtimes should all be dates in the format `YYYY-MM-DD g:i:s a`.
//         Use the appropriate luxon (?) fromFormat() or whatever to deal with them.

// Site's base URL.
const baseURL = 'https://evanstheatre.ca';

/**
 * Check to see if a file exists.
 *
 * @link https://thewebdev.info/2022/02/26/how-to-check-if-a-file-exists-with-node-js/
 *
 * @since 1.0.0
 *
 * @param  {String} file The filename to check.
 * @return {Boolean}     Promise? True if the file exists, false otherwise.
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
 * Gets an image and returns some HTML.
 *
 * Depending on the 'ret' parameter, return an `<img...>` tag,
 * an Open Graph `<meta>` tag, maybe some CSS, or something else.
 *
 * @since 1.0.0
 *
 * @param  {String} src The image source URL.
 * @param  {String} alt The alt text for the image.
 * @param  {String} ret What to return. Default 'imgTag', ie, `<img ...>`.
 * @return {String}     The returned HTML.
 */
async function getImage( src, alt = '', ret = 'imgTag' ) {
	if ( false === await fileExists( src ) ) {
		return '';
	}
	if ( '' === alt ) {
		// @todo Return an error if there's no alt text.
		alt  = 'Alt text should be here.';
	}
	let metadata = await Image(
		src,
		{
			widths:    [ 960, 600, 150, "auto" ],
			formats:   [ "webp", "jpeg" ],
			outputDir: "./public/images",
			urlPath:   "/images/"
		}
	);
	let data = metadata.webp[ metadata.webp.length -1 ];
	if ( 'og' === ret ) {
		return `<meta name="og:image" content=${baseURL}${data.url}">`;
	}
	if ( 'background' === ret ) {
		// @todo Insert media queries into this here CSS.
		return `html {
			background: url( "${data.url}" ) fixed no-repeat top center;
			background-size: cover;
		}
		main {
			margin-top: 20%;
		}
		`;
	}
	return `<img class="the-small-page-image" src="${data.url}" width="${data.width}" height="${data.height}" alt="${alt}"  loading="lazy" decoding="async" />`;
}

/**
 * Gets the next movie coming up.
 *
 * If there's no movie in the pipe, returns {}.
 *
 * @since 1.0.0
 *
 * @param  array movies The list of movies.
 * @return object       The next movie, or empty object.
 */
function getNextMovie() {
	// var movies = collection.getFilteredByGlob("src/movie/**/*.md");
	console.log( movies.length );
	return {};
}

/**
 * Formats a date.
 *
 * @since 1.0.0
 *
 * @todo Convert numeric "dates" from timestamp to a date format.
 *
 * @param  string|Date theDate The date to format.
 * @param  string      format  The desired date format. Accepts 'short', 'shorter', 'shortest'.
 *                             Default DATE_MED_WITH_WEEKDAY + TIME_SIMPLE (ie 'short').
 * @return string              The formatted date, or (on error) theDate.
 */ 
function evansDateFormat( theDate, format = '' ) {
	var myDate = DateTime.fromISO( theDate.toISOString(), { zone: "America/Winnipeg" } );

    if ( ! myDate || myDate.invalid ) {
    	return theDate;
    }

    if ( 'shortest' === format ) {
    	return myDate.toLocaleString( DateTime.DATE_MED );
    }

    return myDate.toLocaleString( DateTime.DATE_MED_WITH_WEEKDAY )
        + ' at '
        + myDate.toLocaleString( DateTime.TIME_SIMPLE );
}

module.exports = function ( eleventyConfig ) {

	// SASS.
	// eleventyConfig.setBrowserSyncConfig({ files: './src/css/**/*.css' });

	// Layout aliases.
	eleventyConfig.addLayoutAlias( 'base', 'layouts/base.njk' );
	eleventyConfig.addLayoutAlias( 'movie', 'layouts/movie.njk' );

	// Collections.
	eleventyConfig.addCollection("movies", function ( collection ) {
	    return collection.getFilteredByGlob("src/movie/**/*.md");
	});

	eleventyConfig.addCollection( "moviesByYear", function( collection ) {
		// @todo Sort this by movie.data.showtime[0] {DESC | ASC}
		return lodash.chain( collection.getFilteredByGlob("src/movie/**/*.md") )
			// Sorts the movies by showtime.
			.sortBy( (movie) => movie.data.showtime[0] )
			// .groupBy((movie) => movie.data.showtime[0].getFullYear() )
			.toPairs()
			// Sorts the movies by year (reversed).
			.reverse()
			.value();
	});

	// Nice date formatting.
	eleventyConfig.addFilter('dateformat', function( theDate ) {
		return evansDateFormat( theDate );
    });

    // Nice date range formatting.
    eleventyConfig.addFilter( 'showtimeRange', function( showtimes ) {
    	var startDate, endDate;
    	startDate = showtimes[0];
    	endDate   = showtimes[ showtimes.length - 1 ];
    	if ( endDate === startDate ) {
    		return evansDateFormat( startDate, 'shortest' );
    	}
    	return evansDateFormat( startDate, 'shortest' ) + '–' + evansDateFormat( endDate, 'shortest' );
    	return '';
    });

    // Set the year-only date format.
    eleventyConfig.addFilter('justTheYear', function( theDate ) {

        var myDate = DateTime.fromISO( theDate.toISOString(), { zone: "America/Winnipeg" } );

        if ( ! myDate || myDate.invalid ) {
            return theDate;
        }
        return myDate.toFormat( 'yyyy' );
    });

	// Shortcodes.
	eleventyConfig.addShortcode( "image", getImage );
	eleventyConfig.addShortcode( "nextMovie", function() {
		return 'hi there';

	});

	eleventyConfig.addShortcode( "currentYear", function() {
		const year = new Date().getFullYear();
		return year;
	});

	// Passthrough copies.
	// Removed b/c SASS compiles straight to public/css.
	// eleventyConfig.addPassthroughCopy("src/css");
	eleventyConfig.addPassthroughCopy("src/images");
	eleventyConfig.addPassthroughCopy("img");
	eleventyConfig.addPassthroughCopy({ 'src/robots.txt': '/robots.txt' });

	// Autoembed stuff.
	eleventyConfig.addPlugin(embedYouTube, {
		'modestBranding': true,
		'noCookie': true,
	});

	// Debugging - Remove before flight.
	// Spit out the current date and time. Helpful in --serve --quiet mode.
	var now = new Date;
	var localNow = DateTime.fromISO( now.toISOString(), { zone: "America/Winnipeg" } );
	console.log(
		localNow.toLocaleString()
		+ ' @ '
		+ localNow.toLocaleString( DateTime.TIME_SIMPLE ) );
	// End of debugging.

	return {
		dir: {
			input:    "src",
			includes: "_includes",
			output:   "public",
		},
		templateFormats: [ "md", "njk", "html", ],
		markdownTemplateEngine: "njk",
		htmlTemplateEngine: "njk",
		dataTemplateEngine: "njk",
	};
};