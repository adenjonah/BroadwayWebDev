"""Business classification for lead qualification.

A place is "qualified" if it's a real business that would benefit from
having a website built — not a park, trail, government office, etc.
"""
from __future__ import annotations

# Types that are NOT website leads. These are Google Places API type strings.
# See: https://developers.google.com/maps/documentation/places/web-service/place-types
NON_BUSINESS_TYPES = frozenset({
    # Nature / recreation
    "park",
    "national_park",
    "state_park",
    "hiking_area",
    "campground",
    "dog_park",
    "playground",
    "garden",
    "marina",
    "ski_resort",
    "swimming_pool",
    "sports_complex",
    "sports_activity_location",
    "stadium",
    "golf_course",
    # Government / civic
    "city_hall",
    "courthouse",
    "fire_station",
    "police",
    "post_office",
    "library",
    "local_government_office",
    "embassy",
    "government_office",
    # Education (public)
    "school",
    "primary_school",
    "secondary_school",
    "university",
    # Religious
    "church",
    "mosque",
    "synagogue",
    "hindu_temple",
    "place_of_worship",
    # Transit / infrastructure
    "bus_station",
    "light_rail_station",
    "subway_station",
    "train_station",
    "transit_station",
    "airport",
    "parking",
    # Water / infrastructure
    "dam",
    "water_treatment",
    "power_station",
    "bridge",
    # Landmarks / geography
    "scenic_overlook",
    "viewpoint",
    "tourist_attraction",
    "point_of_interest",
    "natural_feature",
    "locality",
    "political",
    "neighborhood",
    # Generic (too vague to be a lead on their own)
    "establishment",
    "premise",
    "route",
})

# Types that strongly signal a real business needing a website.
STRONG_BUSINESS_TYPES = frozenset({
    "restaurant",
    "cafe",
    "bakery",
    "bar",
    "meal_delivery",
    "meal_takeaway",
    "food",
    # Services
    "plumber",
    "electrician",
    "roofing_contractor",
    "general_contractor",
    "painter",
    "moving_company",
    "locksmith",
    "car_repair",
    "car_wash",
    "car_dealer",
    "gas_station",
    "auto_parts_store",
    # Retail
    "store",
    "clothing_store",
    "shoe_store",
    "jewelry_store",
    "furniture_store",
    "hardware_store",
    "home_goods_store",
    "convenience_store",
    "grocery_or_supermarket",
    "liquor_store",
    "florist",
    "pet_store",
    "book_store",
    "electronics_store",
    # Health / beauty
    "beauty_salon",
    "hair_care",
    "spa",
    "gym",
    "dentist",
    "doctor",
    "veterinary_care",
    "pharmacy",
    "physiotherapist",
    # Professional
    "accounting",
    "lawyer",
    "real_estate_agency",
    "insurance_agency",
    "travel_agency",
    # Lodging
    "lodging",
    "hotel",
    "motel",
    # Other commercial
    "laundry",
    "dry_cleaning",
    "storage",
    "funeral_home",
})


def is_qualified_business(types: tuple[str, ...]) -> bool:
    """Return True if this place looks like a business that needs a website.

    Logic:
    1. If ANY type is a strong business signal → qualified.
    2. If ALL types are non-business → not qualified.
    3. If there are types we don't recognize (not in either set) → qualified
       (benefit of the doubt — it's probably some kind of business).
    """
    type_set = set(types)

    if type_set & STRONG_BUSINESS_TYPES:
        return True

    # If every type is a known non-business type, reject.
    if type_set and type_set <= NON_BUSINESS_TYPES:
        return False

    # Unknown types remain — could be a business we haven't categorized.
    return bool(type_set - NON_BUSINESS_TYPES)
