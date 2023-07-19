---
title: All Movies
permalink: "/movies/index.html"
layout: base
---


# All Movies

<div class="all-movies">
{% for year, movies in collections.moviesByYear %}
<div id="movies-{{ year }}">

## {{ year }}

<ul class="all-movies movie-list">
{%- for movie in movies %}
<li>
	<a href="{{movie.url}}">{{ movie.data.title }}</a> 
	{% for showtime in movie.data.showtime -%}
	{{ showtime | dateformat }} 
	{%- endfor %}
</li>
{% endfor -%}
</ul><!-- .all-movies movie-list -->
</div><!-- #movies-{{ year }} -->
{% endfor %}
</div><!-- .all-movies -->

### todo
- fix the date spacing in this file (`all-movies.md`)