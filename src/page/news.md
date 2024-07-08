---
title: News
layout: base
permalink: "/news/index.html"
---

{% for yr, articles in collections.articles %}

## {{ yr }}

{% for article in articles %}

### <a href="{{ article.data.permalink }}">{{ article.data.title }}</a> — <span class="article-date">{{ article.data.date | articledateformat }}</span>

> {{ article.data.excerpt | safe }}

{% endfor %}

{% endfor %}

<script>console.log( 'hi pat' );</script>