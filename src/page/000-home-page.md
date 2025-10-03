---
layout: homepage
title: Evans Theatre
excerpt: "Brandon's Indiest Indie Cinema"
permalink: "/index.html"
---

Brandon's indiest indie cinema, on the campus of [Brandon University](https://www.brandonu.ca/).

[About Us](/about/)

{% if collections.moviesUpcoming -%}

## Upcoming Movies

{% slideshow collections.moviesUpcoming %}

{% if collections.homepagenews -%}
<h2>News</h2>
  {% for article in collections.homepagenews.slice(0,1) -%}
  	<a href="{{ article.data.permalink }}">{{ article.data.title }}</a> — {{ article.data.excerpt }} <a href="{{ article.data.permalink }}">Read more »</a>
  {%- endfor %}
{%- endif %}

{%- else -%}

## We're taking a break

There are no movies upcoming at this moment. Please check again closer to {{ 0 | nextSessionMonth }}. Thanks!

{%- endif %}

See you at the movies!