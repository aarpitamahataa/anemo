#!/bin/bash
# Regenerates demo1/ and demo2/ HTML from tpl/. Run from the anemo folder.
cd "$(dirname "$0")"
build(){ sed -e "s|__TITLE__|$2|" -e "s|__CLS__|$3|" -e "s|__H1__|$4|" -e "s|__SUB__|$5|" tpl/story.html > $1/index.html; for p in shop product account; do cp tpl/$p.html $1/$p.html; done; }
build demo1 "Manga Edition" d1 "Wear the <em>wind</em>." "Anime-native oversized tees from four realms. Every scroll turns a page."
build demo2 "Night Sky Edition" d2 "Under one <em>sky</em>." "Four realms. One story. Oversized tees made for the ones who stay up for the next chapter."
sed -i '' "s|each tee = one realm|each tee = one story|" demo1/index.html demo2/index.html
