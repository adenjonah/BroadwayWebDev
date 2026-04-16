"""Lead scoring logic — mirrors the Postgres trigger for local calculation."""

STRONG_BUSINESS_TYPES = frozenset({
    # Food & drink (classic)
    "restaurant", "cafe", "coffee_shop", "bakery", "bar", "deli",
    "meal_delivery", "meal_takeaway", "fast_food_restaurant",
    "salad_shop", "juice_shop", "snack_bar", "food_store", "food",
    "ice_cream_shop", "donut_shop", "confectionery",
    # Food & drink (Google Places API New subtypes)
    "chinese_restaurant", "pizza_restaurant", "thai_restaurant",
    "hot_dog_restaurant", "halal_restaurant", "japanese_restaurant",
    "italian_restaurant", "mexican_restaurant", "korean_restaurant",
    "indian_restaurant", "vietnamese_restaurant", "mediterranean_restaurant",
    "seafood_restaurant", "steak_house", "sushi_restaurant",
    "american_restaurant", "french_restaurant", "greek_restaurant",
    "middle_eastern_restaurant", "ramen_restaurant", "brunch_restaurant",
    "barbecue_restaurant", "fine_dining_restaurant", "afghani_restaurant",
    "african_restaurant", "asian_restaurant", "brazilian_restaurant",
    "breakfast_restaurant", "buffet_restaurant", "cafeteria",
    "candy_store", "cat_cafe", "chocolate_factory", "chocolate_shop",
    "dessert_restaurant", "dessert_shop", "diner", "dog_cafe",
    "food_court", "indonesian_restaurant", "lebanese_restaurant", "pub",
    "sandwich_shop", "spanish_restaurant", "tea_house", "turkish_restaurant",
    "vegan_restaurant", "vegetarian_restaurant", "wine_bar",
    # Beauty & wellness
    "beauty_salon", "hair_care", "hair_salon", "nail_salon", "spa",
    "gym", "fitness_center", "yoga_studio", "massage", "tanning_studio",
    "barber_shop", "skin_care_clinic", "wellness_center",
    # Retail
    "store", "clothing_store", "shoe_store", "jewelry_store",
    "hardware_store", "home_goods_store", "furniture_store",
    "convenience_store", "grocery_or_supermarket", "grocery_store",
    "supermarket", "liquor_store", "pet_store", "book_store",
    "electronics_store", "shopping_mall", "department_store",
    "discount_store", "gift_shop", "sporting_goods_store",
    "thrift_store", "warehouse_store", "wholesaler",
    "bicycle_store", "cell_phone_store", "auto_parts_store",
    # Automotive & trades
    "car_repair", "car_wash", "car_dealer", "gas_station",
    "plumber", "electrician", "roofing_contractor", "general_contractor",
    "painter", "locksmith", "moving_company", "hvac_contractor",
    "landscaping_service", "pest_control", "cleaning_service",
    # Health
    "dentist", "doctor", "veterinary_care", "pharmacy", "physiotherapist",
    "chiropractor", "medical_clinic", "medical_lab", "optometrist",
    "hospital", "urgent_care_clinic", "mental_health_service",
    "acupuncturist", "podiatrist",
    # Professional services
    "accounting", "lawyer", "real_estate_agency", "insurance_agency",
    "travel_agency", "employment_agency", "financial_consultant",
    "marketing_agency", "consultant", "notary_public",
    # Lodging
    "hotel", "motel", "lodging", "bed_and_breakfast", "inn", "resort_hotel",
    # Other commercial
    "laundry", "dry_cleaning", "florist", "funeral_home",
    "storage", "self_storage", "tailor",
    # Entertainment
    "night_club", "bowling_alley", "amusement_park", "arcade",
    "movie_theater", "performing_arts_theater", "karaoke", "casino",
})


def calculate_lead_score(
    phone: str,
    primary_type: str,
    types: tuple[str, ...],
    discovered_website: str = "",
) -> int:
    """Calculate 0-5 lead score based on profile completeness.

    +1 has phone number (reachable)
    +1 strong business type (good client fit)
    +1 confirmed no website anywhere (Google empty AND DDG found none)
    +1 rich Google profile (multiple types = more established)
    +1 complete profile (both phone and primary type present)
    """
    score = 0

    has_phone = bool(phone and phone.strip())
    has_type = bool(primary_type and primary_type.strip())
    ddg_found = bool(discovered_website and discovered_website.strip())

    if has_phone:
        score += 1
    if primary_type in STRONG_BUSINESS_TYPES:
        score += 1
    # Only grant the "no website" bonus when DDG also failed to find one.
    if not ddg_found:
        score += 1
    if len(types) > 1:
        score += 1
    if has_phone and has_type:
        score += 1

    return min(score, 5)
