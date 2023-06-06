module.exports = function ( config ) {

	// Layout aliases.
	config.addLayoutAlias( 'base', 'layouts/base.njk' );
	config.addLayoutAlias( 'movie', 'layouts/movie.njk' );

	// Collections.
	config.addCollection("movies", function ( collection ) {
	    return collection.getFilteredByGlob("src/movie/**/*.md");
	});

	return {
		dir: {
			input:    "src",
			includes: "_includes",
			output:   "public",
		},
	};
};