---
title: All Movies
permalink: "/movies/index.html"
layout: base
---

{% if collections.moviesUpcomingAll -%}
## Coming Soon

Here's what we're showing in the next little while.

{% upcomingMovies collections.moviesUpcomingAll %}
{%- endif %}

## Our Movie History

We've been showing movies since about 1967, when the Brandon Film Festival started up. Our weekend programme started in 1997. Here's a list of all the movies we've shown since 2011.

<div class="all-movies">
{% for year, movies in collections.moviesByYear %}
<div id="movies-{{ year }}">

### {{ year }}

<div class="all-movies movie-list">
{%- for movie in movies %}
<details>
	<summary>
		<a href="{{movie.url}}" title="{{ movie.data.showtime[0] | dateformat }}">{{ movie.data.title }}</a> {% if movie.data.rating %}<span class="movie-rating">({{ movie.data.rating }})</span> {% endif %}<span class="movie-showtime-summary">{{ movie.data.showtime | showtimeRange }}</span>
	</summary>
	<p>{{ movie.data.excerpt }}</p>
	<p>{{ movie.data.showtime | showtimeRange }}</p>
</details>
{% endfor -%}
</div><!-- .all-movies movie-list -->
</div><!-- #movies-{{ year }} -->
{% endfor %}
</div><!-- .all-movies -->
