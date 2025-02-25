// Requirements.
const { createHash } = require( 'node:crypto' );
const lodash         = require( 'lodash' );
const embedYouTube   = require( 'eleventy-plugin-youtube-embed');
const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
require('dotenv').config();

// Fork River libraries. Someday maybe I'll make 'em into Node modules.
const {
	evansDateRange,
	evansDateFormat,
	laterThanToday,
	getNextSessionMonth,
} = require( './lib/forkriver/fr-date-formatting.js' );

const {
	getImage,
	getExcerpt,
	getHero,
	getUpcomingMovies,
	getSlideshow,
	getSlideshowCSS,
} = require( './lib/forkriver/fr-post-components.js' );

const { sortMoviesAsc } = require( './lib/forkriver/fr-file-tools.js' );

/**
 * @todo Set these constants in .env, maybe?
 * @todo Some are in src/_data/site.json; others can be moved there.
 */

/**
 * Display this many movies, at most, on the home page.
 *
 * @since 1.0.0
 *
 * @const int
 */
const moviesOnHomePage  = 10;

/**
 * Max length to trim excerpted content.
 *
 * @since 1.0.0
 *
 * @const int
 */
const excerptTrimLength = 150;

// Site's base URL.
const baseURL = process.env.BASE_URL ?? 'https://evanstheatre.ca';

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

	// @todo - There should be a way to pull moviesUpcomingAll and return the first {n} of it.
	eleventyConfig.addCollection( "moviesUpcoming", function( collection ) {
		var upcomingMovies = lodash.chain( collection.getFilteredByGlob( "src/movie/**/*.md" ) )
		.filter( ( movie ) => laterThanToday( movie.data.showtime ) )
		.value();
		if ( 0 === upcomingMovies.length ) {
			return false;
		}
		// Sorts the movies by date descending.
		upcomingMovies.sort( sortMoviesAsc );
		// Gets the first {moviesOnHomePage} items.
		upcomingMovies = upcomingMovies.slice( 0, moviesOnHomePage );

		return upcomingMovies;
	});

	eleventyConfig.addCollection( "moviesUpcomingAll", function( collection ) {
		var upcomingMovies = lodash.chain( collection.getFilteredByGlob( "src/movie/**/*.md" ) )
		.filter( ( movie ) => laterThanToday( movie.data.showtime ) )
		.value();
		if ( 0 === upcomingMovies.length ) {
			return false;
		}
		// Sorts the movies by date descending.
		upcomingMovies.sort( sortMoviesAsc );

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
        return evansDateFormat( theDate, 'year' );
    });

    // Use "now" in Nunjucks files to create the current date.
    eleventyConfig.addFilter( 'rightNow', function( theDate ) {
    	if ( 'now' === theDate ) {
    		return new Date().toISOString();
    	}
    	return '';
    });

    // SHA256 for the unique IDs.
    eleventyConfig.addFilter( 'mySHA256', function( string ) {
    	const hash = createHash( 'sha256' );
    	hash.update( string );
    	return hash.copy().digest( 'hex' );
    });

    // Get a hash for the upcoming movies.
    eleventyConfig.addNunjucksGlobal( 'dateHash', function() {
    	const hash = createHash( 'md5' );
    	const now  = new Date().toISOString();
    	hash.update( now );
    	return hash.copy().digest( 'hex' );

    });

    // Canonicalize a URL.
    eleventyConfig.addFilter( 'canonicalize', function( url ) {
    	return baseURL + url;
    })

	// Shortcodes.
	eleventyConfig.addShortcode( "image", getImage );
	eleventyConfig.addShortcode( "hero", async function( src, alt ) {
		return getHero( src, alt );
	});
	eleventyConfig.addShortcode( "heroURL", async function( src ) {
		let imageURL = await getImage( src, 'alt', 'heroURL' );
		if ( 0 === imageURL.length ) {
			console.log( "Couldn't get the image for " + src );
			return '';
		}
		return baseURL + imageURL;
	});
	eleventyConfig.addShortcode( 'heroHeight', async function( src ) {
		let height = await getImage( src, 'alt', 'heroHeight' );
		return height;
	});
	eleventyConfig.addShortcode( 'heroWidth', async function( src ) {
		let width = await getImage( src, 'alt', 'heroWidth' );
		return width;
	});
	eleventyConfig.addShortcode( "currentYear", function() {
		const year = new Date().getFullYear();
		return year;
	});

	eleventyConfig.addShortcode( "upcomingMovies", function( movies ) {
		return getUpcomingMovies( movies );
	});

	// Shortcodes for the slideshow (content and CSS).
	eleventyConfig.addShortcode( "slideshow", function( movies ) {
		return getSlideshow( movies );
	});

	eleventyConfig.addShortcode( "slideshowCSS", async function( movies ) {
		return getSlideshowCSS( movies );
	} );


	// Passthrough copies.
	eleventyConfig.addPassthroughCopy("src/images");
	eleventyConfig.addPassthroughCopy({ 'src/robots.txt': 'robots.txt' });
	eleventyConfig.addPassthroughCopy( { 'src/htaccess': '.htaccess'} );
	eleventyConfig.addPassthroughCopy( { 'src/scripts': 'scripts'} );


	// Autoembed stuff.
	eleventyConfig.addPlugin(embedYouTube, {
		'modestBranding': true,
		'noCookie': true,
		// 'lite': true,
		// 'lite.css.inline': false,
		// 'lite.thumbnailFormat': 'webp',
		// 'lite.responsive': true,
		// Note to self: the lite stuff didn't work on mobile.
	});

	// RSS feed.
	eleventyConfig.addPlugin(feedPlugin, {
		type: "rss", // or "rss", "json"
		outputPath: "/movies/feed/index.xml",
		collection: {
			name: "moviesUpcomingAll", // iterate over `collections.posts`
			limit: 10,     // 0 means no limit
		},
		metadata: {
			language: "en",
			title: "Evans Theatre",
			subtitle: "Upcoming Movies at the Evans",
			base: "https://evanstheatre.ca/",
			author: {
				name: "Evans Theatre",
				email: "", // Optional
			}
		}
	});

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
