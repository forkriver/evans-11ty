---
layout: base
title: Evans Theatre
permalink: "/index.html"
---

Brandon's indiest indie cinema, on the campus of [Brandon University](https://www.brandonu.ca/).

[About Us](/about/)

{% if collections.moviesUpcoming %}

## Upcoming Movies

{% for movie in collections.moviesUpcoming %}

### [{{ movie.data.title | safe }}]({{movie.data.permalink}})

{{ movie.data.showtime | upcomingShowtimeRange }}

{{ movie.data.excerpt | safe }}

{% endfor %}

{% else %}

## We're taking a break

There are no movies upcoming at this moment. Please check again closer to {{ 0 | nextSessionMonth }}. Thanks!

{% endif %}

See you at the movies!