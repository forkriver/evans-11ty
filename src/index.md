---
layout: base
title: Evans Theatre
---

Brandon's scrappy little indie cinema, on the campus of [Brandon University](https://www.brandonu.ca/).


{% if collections.moviesUpcoming %}

## Upcoming Movies

{% for movie in collections.moviesUpcoming %}

### [{{ movie.data.title | safe }}]({{movie.data.permalink}})

{{ movie.data.excerpt | safe }}

{% endfor %}

{% else %}

## We're taking a break

There are no movies upcoming at this moment. Please check again closer to September. Thanks!

{% endif %}