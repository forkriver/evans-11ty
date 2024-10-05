const fs             = require( 'fs' );
const markdownit     = require( 'markdown-it' );
const Image          = require( '@11ty/eleventy-img' );
const embedYouTube   = require( 'eleventy-plugin-youtube-embed');
const { fileExists } = require( './fr-file-tools.js' );
const {
	evansDateRange,
	evansDateFormat,
	laterThanToday,
	getNextSessionMonth,
} = require( './fr-date-formatting.js' );

/**
 * Max length to trim excerpted content.
 *
 * @since 1.0.0
 *
 * @const int
 */
const excerptTrimLength = 150;

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
		// Try 'src/'+ src.
		if ( fileExists( 'src/' + src ) ) {
			src = 'src/' + src;
		} else {
			return '';
		}
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
	// OpenGraph meta image.
	case 'og':
		return `<meta name="og:image" content=${baseURL}${data.url}">`;
		break;
	// URL for a CSS snippet.
	case 'css':
		return data.url;
		break;
	// Inline CSs for a background image.
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
	// URL for a hero image.
	case 'heroURL':
		return data.url;
		break;
	// Width of a hero image.
	case 'heroWidth':
		return data.width;
		break;
	// Height of a hero image.
	case 'heroHeight':
		return data.height;
		break;
	// Image tag for a hero image.
	case 'hero':
		return `<img class="full-bleed" src="${data.url}" alt="${alt}"  loading="lazy" decoding="async" />`;
		break;
	// Regular image tag.
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
 * Gets a list of upcoming movies for /upcoming-movies/.
 *
 * @since 1.0.0
 *
 * @param  array movies The collection of upcoming movies.
 * @return string       The "upcoming movies" HTML.
 */ 
function getUpcomingMovies( movies ) {
	var html = '';
	var i    = 0;
	for ( const movie of movies ) {
		i++;
		html += `<p id="movie-${i}">`;
		html += `<a href="${movie.data.permalink}">${movie.data.title}</a><br />`;
		html += '<blockquote class="upcoming-movie-excerpt">' + getExcerpt( movie ) + '</blockquote>';
		html += evansDateRange( movie.data.showtime );
		html += '</p>';
	}
	return html;
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

module.exports = {
	getImage,
	getExcerpt,
	getHero,
	getUpcomingMovies,
	getSlideshow,
	getSlideshowCSS,
};
