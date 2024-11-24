---
layout: homepage
title: Evans Theatre
permalink: "/index.html"
---

Brandon's indiest indie cinema, on the campus of [Brandon University](https://www.brandonu.ca/).

[About Us](/about/)

{% if collections.moviesUpcoming -%}

<aside>
	<strong>Note:</strong> Starting in January 2025, our Sunday shows will be at <strong>2:00pm</strong>, so you can come check out a show in the afternoon and be home before it gets too dark.
</aside>

## Upcoming Movies

{% slideshow collections.moviesUpcoming %}

{%- else -%}

## We're taking a break

There are no movies upcoming at this moment. Please check again closer to {{ 0 | nextSessionMonth }}. Thanks!

{%- endif %}

See you at the movies!