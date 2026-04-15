"""Lead scoring logic — mirrors the Postgres trigger for local calculation."""

STRONG_BUSINESS_TYPES = frozenset({
    "restaurant", "cafe", "coffee_shop", "bakery", "bar", "deli",
    "meal_delivery", "meal_takeaway", "fast_food_restaurant",
    "salad_shop", "juice_shop", "snack_bar", "food_store", "food",
    "beauty_salon", "hair_care", "spa", "gym",
    "store", "clothing_store", "jewelry_store", "hardware_store",
    "grocery_or_supermarket", "liquor_store", "pet_store",
    "car_repair", "car_wash", "plumber", "electrician",
    "roofing_contractor", "painter", "locksmith",
    "dentist", "doctor", "veterinary_care",
    "accounting", "lawyer", "real_estate_agency", "insurance_agency",
    "hotel", "motel", "lodging",
    "laundry", "dry_cleaning", "florist", "funeral_home",
    "moving_company", "storage", "travel_agency",
    "pharmacy", "physiotherapist",
    "night_club", "bowling_alley", "amusement_park",
})


def calculate_lead_score(
    phone: str,
    primary_type: str,
    types: tuple[str, ...],
) -> int:
    """Calculate 0-5 lead score based on profile completeness.

    +1 has phone number (reachable)
    +1 strong business type (good client fit)
    +1 confirmed no website (always true for leads in our pipeline)
    +1 rich Google profile (multiple types = more established)
    +1 complete profile (both phone and primary type present)
    """
    score = 0

    has_phone = bool(phone and phone.strip())
    has_type = bool(primary_type and primary_type.strip())

    if has_phone:
        score += 1
    if primary_type in STRONG_BUSINESS_TYPES:
        score += 1
    # All leads passed DDG verification = confirmed no website
    score += 1
    if len(types) > 1:
        score += 1
    if has_phone and has_type:
        score += 1

    return min(score, 5)
