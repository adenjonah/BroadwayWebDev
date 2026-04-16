"""Secondary verification: does this business have a discoverable website
anywhere on the web, even if it's not listed on their Google profile?

Uses the maintained `ddgs` library for DuckDuckGo text search. Returns
True if a plausible (non-directory) business website appears in the top
results.
"""
from __future__ import annotations

import time
from urllib.parse import urlparse

from ddgs import DDGS

# Domains that are directory listings, not the business's own site.
DIRECTORY_DOMAINS = {
    "facebook.com", "m.facebook.com", "instagram.com", "twitter.com", "x.com",
    "yelp.com", "tripadvisor.com", "tripadvisor.co.uk", "yellowpages.com",
    "bbb.org", "mapquest.com", "foursquare.com", "opentable.com",
    "grubhub.com", "doordash.com", "ubereats.com", "postmates.com",
    "linkedin.com", "youtube.com", "tiktok.com", "pinterest.com",
    "google.com", "google.co.uk", "maps.google.com", "goo.gl",
    "apple.com", "maps.apple.com", "bing.com", "duckduckgo.com",
    "wikipedia.org", "reddit.com", "nextdoor.com", "manta.com",
    "chamberofcommerce.com", "superpages.com", "citysearch.com",
    "angieslist.com", "angi.com", "houzz.com", "thumbtack.com",
    "zomato.com", "allmenus.com", "menupages.com", "seamless.com",
    "nyctourism.com", "storeshours.com", "hericollny.com", "mapcarta.com",
    "hours-guide.com", "findglocal.com", "loc8nearme.com",
    "restaurantji.com", "menupix.com", "order.online", "slicelife.com",
    "toasttab.com", "chownow.com", "clover.com", "squareup.com",
    "beyondmenu.com", "menuwithprice.com", "zmenu.com", "sirved.com",
    "restaurantguru.com", "restaurants.com", "restaurantji.com",
    "linktr.ee", "beacons.ai", "linkin.bio", "carrd.co", "lnk.bio",
    "bento.me", "msha.ke", "taplink.cc", "about.me",
    "twofoodies.com", "menuism.com", "eatapp.co",
    "usarestaurants.info", "menulist.menu", "zaubacorp.com",
    "allevents.in", "eventbrite.com", "nextdoor.com",
    "bringmethat.com", "papajohns.com",
    # Food blogs, review aggregators, and other non-business sites
    "foodlovergirl.com", "studynearme.com", "mapich.com",
    "city-data.com", "wheree.com", "findopen.com",
    "localbusiness.guide", "smartscrapers.com", "place123.net",
    "nicelocal.com", "cylex.us.com", "hotfrog.com",
    "directmap.us", "placeandsee.com", "cybo.com",
    "brownbook.net", "tupalo.co", "communitywalk.com",
    # University/edu sites are not the business's website
    "columbia.edu", "nyu.edu", "cuny.edu",
}


def _domain(url: str) -> str:
    try:
        netloc = urlparse(url).netloc.lower()
        return netloc[4:] if netloc.startswith("www.") else netloc
    except Exception:
        return ""


def _is_directory(url: str) -> bool:
    d = _domain(url)
    return any(d == dd or d.endswith("." + dd) for dd in DIRECTORY_DOMAINS)


def find_discoverable_website(name: str, address: str, max_results: int = 10) -> str:
    """Returns the first non-directory website URL found, or "" if none.

    Used to populate the lead's `discovered_website` column so leads where
    DDG turned up a site still become leads — just with a lower score.
    """
    if not name:
        return ""
    query = f'"{name}" {address}'.strip()
    try:
        results = list(DDGS().text(query, max_results=max_results))
    except Exception:
        return ""

    for r in results:
        href = r.get("href") or ""
        if not href.startswith("http"):
            continue
        if _is_directory(href):
            continue
        return href
    return ""


def has_discoverable_website(name: str, address: str, max_results: int = 10) -> bool:
    """Back-compat wrapper around find_discoverable_website."""
    return bool(find_discoverable_website(name, address, max_results))


def polite_sleep(seconds: float = 1.5) -> None:
    time.sleep(seconds)
