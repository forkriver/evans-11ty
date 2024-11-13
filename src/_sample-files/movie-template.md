---
# Sample movie file
title: "{movie title}"
layout: movie
excerpt: "{excerpt, if desired}"
date: Last Modified {or YYYY-MM-DD HH:MM:SS}
modified: Last Modified
permalink: "/movie/{slugified-title}/"
tags: 
- movie
- movie-{year}
featured_img: /images/feature/{movie image}.jpg
featured_alt: "{alt text for the image, if desired; defaults to 'Still from {movie}'}"
showtime: 
 - YYYY-MM-DD 7:30:00 pm
 - YYYY-MM-DD 7:30:00 pm
 - YYYY-MM-DD 7:30:00 pm
 {...}

# Optional items follow
rating:
  rating: "{rating}"
  notes:  "{rating notes}"

# @todo - make sure this is processed
special_event:
  special_event: true
  organization: "{Organization Name}"
  passes: "void|accepted"
note: "Text of the note. {Markdown won't be processed; HTML should be OK.}"

---

{Note: don't put the movie title in the body of the Markdown file}

{Movie synopsis here}

{YouTube URL, if any}