// Requirements.
const lodash       = require( 'lodash' );
const { DateTime } = require( 'luxon' );
const Image        = require( '@11ty/eleventy-img' );
const fs           = require( 'fs' );
const embedYouTube = require( 'eleventy-plugin-youtube-embed');

/**
 * @todo Set these constants in .env, maybe?
 */

/**
 * Display this many movies, at most, on the home page.
 *
 * @since 1.0.0
 *
 * @const int
 */
const moviesOnHomePage  = 5;

/**
 * Max length to trim excerpted content.
 *
 * @since 1.0.0
 *
 * @const int
 */
const excerptTrimLength = 150;


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

	switch ( ret ) {
	case 'og':
		return `<meta name="og:image" content=${baseURL}${data.url}">`;
		break;
	case 'css':
		return data.url;
		break;
	case 'background':
		// @todo Insert media queries into this here CSS.
		return `
		/* Inline CSS. */
		body {
			margin: 0;
		}
		#background {
			height: 100vw;
			width: 100%;
			background: url( "${data.url}" ) fixed no-repeat top center;
			background-size: cover;
			background-position: center;
			background-repeat: no-repeat;
			background-size: cover;
			filter: blur( 32px );
		}
		main {
			position: absolute;
			top: 2em;
			left: 50%;
			transform: translate( -50%, 0 );
			z-index: 2;
			margin-bottom: 2em;
		}

		main img.hero {
			width: 100%;
			height: auto;
			text-align: center;
		}
		`;
		break;
	case 'hero':
		return `<img class="full-bleed" src="${data.url}" alt="${alt}"  loading="lazy" decoding="async" />`;
		break;
	default:
		return `<img class="the-small-page-image" src="${data.url}" width="${data.width}" height="${data.height}" alt="${alt}"  loading="lazy" decoding="async" />`;
	}

}

async function getHero( src, alt, sizes = '100vw' ) {
	if ( alt === undefined ) {
		// You bet we throw an error on missing alt (alt="" works okay)
		alt = 'Alt Text belongs here';
	}

	let metadata = await Image(src, {
		widths:  [300, 600, 960, 1500 ],
		formats: ["webp", "jpeg"],
		outputDir: "./public/images",
		urlPath:   "/images/",
	});

	let lowsrc = metadata.jpeg[0];
	let highsrc = metadata.jpeg[metadata.jpeg.length - 1];

	return `<picture class="full-bleed">
	${Object.values(metadata)
		.map((imageFormat) => {
			return `  <source type="${
				imageFormat[0].sourceType
			}" srcset="${imageFormat
				.map((entry) => entry.srcset)
				.join(", ")}" sizes="${sizes}">`;
		})
		.join("\n")}
		<img
			src="${lowsrc.url}"
			width="${highsrc.width}"
			height="${highsrc.height}"
			alt="${alt}"
			loading="lazy"
			decoding="async"
		/>
	</picture>`;
}

/**
 * Gets the excerpt text. If none is set, use the content.
 *
 * @since 1.0.0
 *
 * @param  object movie The movie.
 * @return string       The excerpt text.
 */
function getExcerpt( movie, length = 200 ) {
	const markdownit = require( 'markdown-it' );
	const md         = markdownit();
	var myContent;
	if ( movie.data.excerpt && 0 < movie.data.excerpt.length ) {
		myContent = movie.data.excerpt;
		if ( myContent.length > excerptTrimLength ) {
			myContent = myContent.substring( 0, excerptTrimLength ) + '...';

		}
		return md.render( myContent );
	}
	// If there's no excerpt, get the content from the Markdown file.
	const fs = require( 'node:fs' );
	const content = fs.readFileSync( movie.inputPath, 'utf8', ( err, content ) => {
		if ( err ) {
			console.log( err.code + ' ' + err.path );
			return '';
		}
		return content;
	} );
	if ( 0 < content.length ) {
		// Removes the frontmatter from the Markdown file.
		// @link https://stackoverflow.com/a/5884735/1094518 for the regex.
		let myContent = content.replace( /---[\s\S]*?---/,'' ).trim();
		if ( myContent.length > excerptTrimLength ) {
			myContent = myContent.substring( 0, excerptTrimLength ) + '...';
		}
		return( md.render( myContent ) );
	}
	// Nothing's worked; bail out as gracefully as possible.
	return md.render( 'Why is *this* ending up here?');
}

/**
 * Gets the slideshow for the home page.
 *
 * Callback function for the "slideshow" shortcode.
 *
 * @since 1.0.0
 *
 * @link https://glidejs.com/docs/ The slideshow docs.
 *
 * @param  array movies The collection of upcoming movies.
 * @return string       The slideshow HTML.
 */
function getSlideshow( movies ) {
	var html = '';
	if ( 1 === movies.length ) {
		const movie = movies[0];
		html += '<div id="movie-background">';
		html += '<div class="evans-slide-wrap">';
    	html += `<h2 class="evans-slide movie-title"><a href="${movie.data.permalink}">${movie.data.title}</a></h2>`;
    	html += '<p class="evans-slide movie-date-range">' + evansDateRange( movie.data.showtime ) + '</p>';
    	html += '<p class="evans-slide excerpt">' + getExcerpt( movie ) + '</p>';
    	html += '</div><!-- .evans-slide-wrap -->' + "\n";
    	html += '</div><!-- #movie-background -->' + "\n";
    	return html;
	}

	html += `
<div class="glide">
  <div class="glide__track" data-glide-el="track">
    <ul class="glide__slides">`;
    for ( const movie of movies ) {
    	html += '<li class="glide__slide" id="movie-'
    		+ movie.data.permalink.replace( /\//g, '-' )
    		+ '">';
    	html += '<div class="evans-slide-wrap">';
    	html += `<h2 class="evans-slide movie-title"><a href="${movie.data.permalink}">${movie.data.title}</a></h2>`;
    	html += '<p class="evans-slide movie-date-range">' + evansDateRange( movie.data.showtime ) + '</p>';
    	html += '<p class="evans-slide excerpt">' + getExcerpt( movie )+ '</p>';
    	html += '</div><!-- .evans-slide-wrap -->' + "\n";
    	html += '</li>' + "\n";
    }
    html += `</ul>
  </div>
  <div class="glide__arrows" data-glide-el="controls">
    <button class="glide__arrow glide__arrow--left" data-glide-dir="<">prev</button>
    <button class="glide__arrow glide__arrow--right" data-glide-dir=">">next</button>
  </div>
</div>
`;

	return html;

}

/**
 * Gets the slideshow for the home page.
 *
 * Callback function for the "slideshowCSS" shortcode.
 *
 * @since 1.0.0
 *
 * @link https://glidejs.com/docs/ The slideshow docs.
 *
 * @param  array movies The collection of upcoming movies.
 * @return string       The slideshow CSS.
 */
async function getSlideshowCSS( movies ) {
	var css = '';
	if ( 1 == movies.length ) {
		const movie = movies[0];
		css += '#movie-background {' + "\n";
		const url = await getImage( 'src' + movie.data.featured_img, 'For CSS', 'css' );
		css += `background: url( "${url}" );\n`;
		css += `background-size: cover;\n`;
		css += 'padding: 2em;';
		css += '}' + "\n";
	} else {
		for ( const movie of movies ) {
			css += '.glide__slide#movie-' + movie.data.permalink.replace( /\//g, '-' ) + ' {' + "\n";
			if ( movie.data.featured_img ) {
				const url = await getImage( 'src' + movie.data.featured_img, 'For CSS', 'css' );
				css += `background: url( "${url}" );\n`;
				css += 'background-size: cover;' + "\n";
			}
			css += '}' + "\n";
		}
		// CSS for the slideshow buttons.
		css += `
		.glide__arrow {
			top: 100%;
			background-color: rgba( 32, 32, 32, 0.7 );
			backdrop-filter: blur( 2px );
			transform: translateY( -32px );
		}
		`;
	}
	css += `
		.evans-slide-wrap {
			background: rgba( 24, 32, 48, 0.7 );
			backdrop-filter: blur( 2px );
			padding: 1em;
			margin: 1em;
			margin-top: 3em;
			border-radius: 32px;
		}
		`;
	css = `<style>\n${css}\n</style>`;
	return css;
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
 * @param  string      format  The desired date format.
 *                             Accepts a Luxon date format string,
 *                             'epoch' (for seconds), 'mdy', 'md', or 'year'.
 *                             Defaults to m-d-Y at h:m a.
 * @return string              The formatted date, or (on error) theDate.
 */ 
function evansDateFormat( theDate, format = '' ) {

	if ( 'Last Modified' === theDate ) {
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

module.exports = function ( eleventyConfig ) {

	// SASS.
	// eleventyConfig.setBrowserSyncConfig({ files: './src/css/**/*.css' });

	// Layout aliases.
	eleventyConfig.addLayoutAlias( 'base',     'layouts/base.njk' );
	eleventyConfig.addLayoutAlias( 'homepage', 'layouts/homepage.njk' );
	eleventyConfig.addLayoutAlias( 'movie',    'layouts/movie.njk' );
	eleventyConfig.addLayoutAlias( 'article',  'layouts/article.njk' );

	// Collections.
	eleventyConfig.addCollection("movies", function ( collection ) {
	    return collection.getFilteredByGlob("src/movie/**/*.md");
	});

	eleventyConfig.addCollection( "moviesByYear", function( collection ) {
		return lodash.chain( collection.getFilteredByGlob("src/movie/**/*.md") )
			// Sorts the movies by showtime.
			.sortBy( (movie) => movie.data.showtime[0] )
			.groupBy( (movie) => evansDateFormat( movie.data.showtime[0], 'year' ) )
			.toPairs()
			// Sorts the movies by year (reversed).
			.reverse()
			.value();
	});

	eleventyConfig.addCollection( "moviesUpcoming", function( collection ) {
		var upcomingMovies = lodash.chain( collection.getFilteredByGlob( "src/movie/**/*.md" ) )
		.filter( ( movie ) => laterThanToday( movie.data.showtime ) )
		.slice( 0, moviesOnHomePage )
		.value();
		if ( 0 === upcomingMovies.length ) {
			return false;
		}
		// Sorts the movies by date descending.
		upcomingMovies.sort( function( a, b ) {
			let aLatest = 0;
			let bLatest = 0;
			let aShowtimeSeconds, bShowtimeSeconds;
			for ( const aShowtime of a.data.showtime ) {
				aShowtimeSeconds = evansDateFormat( aShowtime, 'epoch' );
				if ( aShowtimeSeconds > aLatest ) {
					aLatest = aShowtimeSeconds;
				}
			}
			for ( const bShowtime of b.data.showtime ) {
				bShowtimeSeconds = evansDateFormat( bShowtime, 'epoch' );
				if ( bShowtimeSeconds > bLatest ) {
					bLatest = bShowtimeSeconds;
				}
			}
			return aLatest - bLatest;
		} );

		return upcomingMovies;
	});

	eleventyConfig.addCollection( "articles", function( collection ) {
		return lodash.chain( collection.getFilteredByGlob( 'src/article/**/*.md' ) )
			.sortBy( ( article ) => article.date )
			// Reverse the sorting of all the articles.
			.reverse()
			.groupBy( ( article ) => article.date.getFullYear() )
			.toPairs()
			// Reverses the Year listing.
			.reverse()
			.value();
	});

	// Nice date formatting.
	eleventyConfig.addFilter('dateformat', function( theDate ) {
		return evansDateFormat( theDate );
    });

    // Article date formatting.
    eleventyConfig.addFilter( 'articledateformat', function( theDate ) {
    	return evansDateFormat( theDate, 'mdy' );
    });

    // Nice date range formatting.
    eleventyConfig.addFilter( 'showtimeRange', function( showtimes ) {
    	return evansDateRange( showtimes );
    });

    eleventyConfig.addFilter( 'upcomingShowtimeRange', function( showtimes ) {
    	var upcomingOnly = true;
    	return evansDateRange( showtimes, upcomingOnly );
    });

    eleventyConfig.addFilter( 'nextSessionMonth', function( month ) {
    	return getNextSessionMonth();
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
	eleventyConfig.addShortcode( "hero", async function( src, alt ) {
		return getHero( src, alt );
	});
	eleventyConfig.addShortcode( "currentYear", function() {
		const year = new Date().getFullYear();
		return year;
	});

	// Shortcodes for the slideshow (content and CSS).
	eleventyConfig.addShortcode( "slideshow", function( movies ) {
		return getSlideshow( movies );
	});

	eleventyConfig.addShortcode( "slideshowCSS", async function( movies ) {
		return getSlideshowCSS( movies );
	} );


	// Passthrough copies.
	// Removed b/c SASS compiles straight to public/css.
	// eleventyConfig.addPassthroughCopy("src/css");
	eleventyConfig.addPassthroughCopy("src/images");
	// eleventyConfig.addPassthroughCopy("img");
	eleventyConfig.addPassthroughCopy({ 'src/robots.txt': '/robots.txt' });
	eleventyConfig.addPassthroughCopy( { 'src/htaccess': '/.htaccess'} );
	eleventyConfig.addPassthroughCopy( { 'src/scripts': '/scripts'} );


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