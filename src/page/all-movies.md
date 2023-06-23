---
title: All Movies
permalink: "/movies/index.html"
layout: base
---


# All Movies

{% for year, movies in collections.moviesByYear %}
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
{% endfor %}

### todo
- fix the date spacing in this file (`all-movies.md`)