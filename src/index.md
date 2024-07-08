---
layout: base
title: Evans Theatre
---

Brandon's scrappy little indie cinema, on the campus of [Brandon University](https://www.brandonu.ca/).

{% for year, movies in collections.moviesByYear %}

{% endfor %}

{% if collections.moviesUpcoming %}

{% for movie in collections.moviesUpcoming %}
## [{{ movie.data.title | safe }}]({{movie.data.permalink}})
{{ movie.data.excerpt | safe }}
{% endfor %}


{% else %}

There are no movies upcoming at this moment. Please check again closer to September. Thanks!

{% endif %}