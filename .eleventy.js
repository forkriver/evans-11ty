const lodash       = require( 'lodash' );
const { DateTime } = require( 'luxon' );
const Image        = require("@11ty/eleventy-img");
const baseURL      = 'https://evanstheatre.ca';

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
			background: url( "${data.url}" ) fixed no-repeat center center;
			background-size: cover;
		}
		main {
			width: 55em;
			max-width: 95%;
			margin: auto;
			margin-top: 20%;
			background: rgba( 32, 32, 32, 0.5 );
			backdrop-filter: blur( 10px ) grayscale( 25% );
			border-radius: 1em;
			padding: 2em;
		}
		`;
	}
	return `<img class="the-small-page-image" src="${data.url}" width="${data.width}" height="${data.height}" alt="${alt}"  loading="lazy" decoding="async" />`;
}

module.exports = function ( eleventyConfig ) {

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
			.groupBy((movie) => movie.data.showtime[0].getFullYear() )
			.toPairs()
			.reverse()
			.value();
	});

	// Nice date formatting.
	eleventyConfig.addFilter('dateformat', function( theDate ) {
        var myDate = DateTime.fromISO( theDate.toISOString(), { zone: "America/Winnipeg" } );

        if ( ! myDate || myDate.invalid ) {
        	return theDate;
        }

        return myDate.toLocaleString( DateTime.DATE_MED_WITH_WEEKDAY )
            + ' at '
            + myDate.toLocaleString( DateTime.TIME_SIMPLE );
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

	// Passthrough copies.
	eleventyConfig.addPassthroughCopy("src/css");
	eleventyConfig.addPassthroughCopy("src/images");
	eleventyConfig.addPassthroughCopy("img");``

	// Debugging - Remove before flight.
	// Spit out the current date and time. Helpful in --serve --quiet mode.
	var now = new Date;
	var localNow = DateTime.fromISO( now.toISOString(), { zone: "America/Winnipeg" } );
	console.log( localNow.toLocaleString( DateTime.TIME_SIMPLE ) );
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