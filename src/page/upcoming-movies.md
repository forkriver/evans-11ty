---
title: Upcoming Movies
layout: base
permalink: "/upcoming-movies/index.html"
excerpt: "Coming Attractions: movies we'll be showing soon"
---

{% if collections.moviesUpcomingAll -%}

## Showtimes

Movies will show at **7:30pm** on Friday and Saturday, and at **2:00pm** on Sunday, unless otherwise indicated.

{% upcomingMovies collections.moviesUpcomingAll %}

{%- else -%}

There are no movies upcoming at this moment. Please check again closer to {{ 0 | nextSessionMonth }}. Thanks!

{% endif -%}