---
# Sample movie file
title: "{movie title}"
layout: movie
excerpt: "{excerpt, if desired}"
date: YYYY-MM-DD HH:MM:SS {published date}
modified: YYYY-MM-DD HH:MM:SS {modified date}
permalink: "movie/{year}/{slugified title}/index.html"
tags: ["evans_movie"]
featured_img: /images/feature/{movie image}.jpg
remote_featured_image: http://evanstheatre.ca/wp-content/uploads/2022/12/benediction.jpg
showtime: 
 - YYYY-MM-DD 19:30:00 -0{5|6}:00
 - YYYY-MM-DD 19:30:00 -0{5|6}:00
 - YYYY-MM-DD 19:30:00 -0{5|6}:00 // ...

# Optional items follow
rating:
  rating: "{rating}"
  notes:  "{rating notes}"

special_event:
  special_event: true
  organization: "{Organization Name}"
  passes: "void|accepted"

---

{Movie synopsis here}

{YouTube embed code, if any}