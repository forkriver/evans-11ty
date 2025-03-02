---
title: About the Evans
layout: base
permalink: '/about/index.html'
featured_img: /images/feature/ff-header.jpg
---

This is the Evans Theatre, Brandon's indiest indie cinema. We show movies most weekend from September to the end of April. We're all volunteers here, and we'd love to have you join us!

{% if socialMedia.socialMedia -%}
## Let's Get Social

{% for name, item in socialMedia.socialMedia -%}
{%- if item.url -%}<a href="{{ item.url }}">{%- endif -%}
<span class="social-icon {{ name }}-icon" title="{{ item.hover }}"></span>
{%- if item.url -%}</a>{%- endif -%}
{% endfor %}
</ul>
{%- endif %}
