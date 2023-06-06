---
title: Movies
layout: base
date: 2023-06-05 12:00:00
---

# Movies

{% for movie in collections.movies %}
<a href="{{movie.url}}">{{ movie.data.title }} ({{ movie.data.date }})</a><br />
{% endfor %}

