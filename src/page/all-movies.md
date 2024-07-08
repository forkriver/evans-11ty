---
title: All Movies
permalink: "/movies/index.html"
layout: base
---


<div class="all-movies">
{% for year, movies in collections.moviesByYear %}
<div id="movies-{{ year }}">

## {{ year }}

<div class="all-movies movie-list">
{%- for movie in movies %}
<details>
	<summary>
		<a href="{{movie.url}}" title="{{ movie.data.showtime[0] | dateformat }}">{{ movie.data.title }}</a> 
	</summary>
	<p>{{ movie.data.excerpt }}</p>
	<ul class="showtime-list">
		{% for showtime in movie.data.showtime -%}
		<li>{{ showtime | dateformat }}</li>
		{%- endfor %}
	</ul>
</details>
{% endfor -%}
</div><!-- .all-movies movie-list -->
</div><!-- #movies-{{ year }} -->
{% endfor %}
</div><!-- .all-movies -->
