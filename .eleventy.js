const lodash  = require( 'lodash' );
const Image   = require("@11ty/eleventy-img");
const baseURL = 'https://evanstheatre.ca';

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
		return `html {
			background: url( "${data.url}" ) fixed no-repeat center center;
			background-size: cover;
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

	// Shortcodes.
	eleventyConfig.addAsyncShortcode( "image", getImage );

	// Passthrough copies.
	eleventyConfig.addPassthroughCopy("src/css");
	eleventyConfig.addPassthroughCopy("src/images");
	eleventyConfig.addPassthroughCopy("img");``

	// Spit out the current date and time. Helpful in --serve --quiet mode.
	var now = new Date();
	console.log( now.toISOString() );

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