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

<div class="all-movies movie-list">
{%- for movie in movies %}
<details>
	<summary>
		<a href="{{movie.url}}" title="{{ movie.data.showtime[0] | dateformat }}">{{ movie.data.title }}</a> 
	</summary>
	<p>{{ movie.data.excerpt }}</p>
	<p>
		{% for showtime in movie.data.showtime -%}
		{{ showtime | dateformat }}<br />
		{%- endfor %}
	</p>
</details>
{% endfor -%}
</div><!-- .all-movies movie-list -->
</div><!-- #movies-{{ year }} -->
{% endfor %}
</div><!-- .all-movies -->

### todo
- fix the date spacing in this file (`all-movies.md`)
- order by `DATE DESC`