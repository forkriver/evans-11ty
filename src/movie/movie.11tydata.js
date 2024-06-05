// Movie data file.
module.exports = {
	layout: "movie",
	tags: [ "evans_movie", "movie" ],
	permalink: function( {title} ) {
		return `/movie/${this.slugify(title)}/`;
	},
};