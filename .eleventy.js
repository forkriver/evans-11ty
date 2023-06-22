const lodash = require( 'lodash' );
const { DateTime } = require( 'luxon' );

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

	// Nice date formatting.
	config.addFilter('dateformat', function( theDate ) {
        var myDate = DateTime.fromISO( theDate.toISOString(), { zone: "America/Winnipeg" } );

        if ( ! myDate || myDate.invalid ) {
        	return theDate;
        }

        return myDate.toLocaleString( DateTime.DATE_MED_WITH_WEEKDAY )
            + ' at '
            + myDate.toLocaleString( DateTime.TIME_SIMPLE );
    });

    // Set the year-only date format.
    config.addFilter('justTheYear', function( theDate ) {

        var myDate = DateTime.fromISO( theDate.toISOString(), { zone: "America/Winnipeg" } );

        if ( ! myDate || myDate.invalid ) {
            return theDate;
        }
        return myDate.toFormat( 'yyyy' );
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