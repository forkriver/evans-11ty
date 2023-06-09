const lodash = require( 'lodash' );

module.exports = function ( config ) {

	// Layout aliases.
	config.addLayoutAlias( 'base', 'layouts/base.njk' );
	config.addLayoutAlias( 'movie', 'layouts/movie.njk' );

	// Collections.
	config.addCollection("movies", function ( collection ) {
	    return collection.getFilteredByGlob("src/movie/**/*.md");
	});

	config.addCollection( "moviesByYear", function( collection ) {
		// @todo Sort this by movie.data.showtime[0] {DESC | ASC}
		return lodash.chain( collection.getFilteredByGlob("src/movie/**/*.md") )
			.groupBy((movie) => movie.data.showtime[0].getFullYear() )
			.toPairs()
			.reverse()
			.value();
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