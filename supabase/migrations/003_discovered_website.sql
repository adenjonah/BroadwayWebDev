-- ═══════════════════════════════════════════════════════════
-- Broadway Web Dev — Discovered Website + Expanded Type Coverage
--
-- Changes:
--   1. Leads now track any website DDG turned up during secondary
--      verification, so we can see *why* a place did or didn't score
--      the "no website" bonus.
--   2. The scoring trigger now looks at that column.
--   3. is_strong_business_type is expanded to cover Google Places
--      API (New) subtypes (chinese_restaurant, pizza_restaurant,
--      nail_salon, chiropractor, shopping_mall, etc.).
-- ═══════════════════════════════════════════════════════════

alter table public.leads
  add column if not exists discovered_website text not null default '';

-- Expanded strong-business classifier covering Google Places API (New) subtypes.
create or replace function is_strong_business_type(ptype text)
returns boolean as $$
begin
  return ptype in (
    -- Food & drink (classic)
    'restaurant', 'cafe', 'coffee_shop', 'bakery', 'bar', 'deli',
    'meal_delivery', 'meal_takeaway', 'fast_food_restaurant',
    'salad_shop', 'juice_shop', 'snack_bar', 'food_store', 'food',
    'ice_cream_shop', 'donut_shop', 'confectionery',
    -- Food & drink (new cuisine subtypes)
    'chinese_restaurant', 'pizza_restaurant', 'thai_restaurant',
    'hot_dog_restaurant', 'halal_restaurant', 'japanese_restaurant',
    'italian_restaurant', 'mexican_restaurant', 'korean_restaurant',
    'indian_restaurant', 'vietnamese_restaurant', 'mediterranean_restaurant',
    'seafood_restaurant', 'steak_house', 'sushi_restaurant',
    'american_restaurant', 'french_restaurant', 'greek_restaurant',
    'middle_eastern_restaurant', 'ramen_restaurant', 'brunch_restaurant',
    'barbecue_restaurant', 'fine_dining_restaurant', 'afghani_restaurant',
    'african_restaurant', 'asian_restaurant', 'brazilian_restaurant',
    'breakfast_restaurant', 'buffet_restaurant', 'cafeteria',
    'candy_store', 'cat_cafe', 'chocolate_factory', 'chocolate_shop',
    'dessert_restaurant', 'dessert_shop', 'diner', 'dog_cafe',
    'fast_food_restaurant', 'food_court', 'indonesian_restaurant',
    'lebanese_restaurant', 'pub', 'ramen_restaurant', 'sandwich_shop',
    'spanish_restaurant', 'tea_house', 'turkish_restaurant',
    'vegan_restaurant', 'vegetarian_restaurant', 'wine_bar',
    -- Beauty & wellness
    'beauty_salon', 'hair_care', 'hair_salon', 'nail_salon', 'spa',
    'gym', 'fitness_center', 'yoga_studio', 'massage', 'tanning_studio',
    'barber_shop', 'skin_care_clinic', 'wellness_center',
    -- Retail
    'store', 'clothing_store', 'shoe_store', 'jewelry_store',
    'hardware_store', 'home_goods_store', 'furniture_store',
    'convenience_store', 'grocery_or_supermarket', 'grocery_store',
    'supermarket', 'liquor_store', 'pet_store', 'book_store',
    'electronics_store', 'shopping_mall', 'department_store',
    'discount_store', 'gift_shop', 'sporting_goods_store',
    'thrift_store', 'warehouse_store', 'wholesaler',
    'bicycle_store', 'cell_phone_store', 'auto_parts_store',
    -- Automotive & trades
    'car_repair', 'car_wash', 'car_dealer', 'gas_station',
    'plumber', 'electrician', 'roofing_contractor', 'general_contractor',
    'painter', 'locksmith', 'moving_company', 'hvac_contractor',
    'landscaping_service', 'pest_control', 'cleaning_service',
    -- Health
    'dentist', 'doctor', 'veterinary_care', 'pharmacy', 'physiotherapist',
    'chiropractor', 'medical_clinic', 'medical_lab', 'optometrist',
    'hospital', 'urgent_care_clinic', 'mental_health_service',
    'acupuncturist', 'podiatrist',
    -- Professional services
    'accounting', 'lawyer', 'real_estate_agency', 'insurance_agency',
    'travel_agency', 'employment_agency', 'financial_consultant',
    'marketing_agency', 'consultant', 'notary_public',
    -- Lodging
    'hotel', 'motel', 'lodging', 'bed_and_breakfast', 'inn', 'resort_hotel',
    -- Other commercial
    'laundry', 'dry_cleaning', 'florist', 'funeral_home',
    'storage', 'self_storage', 'tailor',
    -- Entertainment
    'night_club', 'bowling_alley', 'amusement_park', 'arcade',
    'movie_theater', 'performing_arts_theater', 'karaoke', 'casino'
  );
end;
$$ language plpgsql immutable;

-- Scoring trigger: use the new discovered_website column to decide whether
-- to grant the "confirmed no website" +1.
create or replace function calculate_lead_score()
returns trigger as $$
declare
  score integer := 0;
begin
  -- +1 has phone number (reachable)
  if new.phone <> '' then
    score := score + 1;
  end if;

  -- +1 strong business type (good client fit)
  if is_strong_business_type(new.primary_type) then
    score := score + 1;
  end if;

  -- +1 confirmed no website anywhere (Google says no AND DDG found no site)
  if coalesce(new.discovered_website, '') = '' then
    score := score + 1;
  end if;

  -- +1 rich Google profile (multiple types = more established)
  if array_length(new.types, 1) > 1 then
    score := score + 1;
  end if;

  -- +1 complete profile (both phone and type present)
  if new.phone <> '' and new.primary_type <> '' then
    score := score + 1;
  end if;

  new.lead_score := score;
  return new;
end;
$$ language plpgsql;

-- Re-bind the trigger so it also fires on discovered_website changes.
drop trigger if exists trg_lead_score on public.leads;
create trigger trg_lead_score
  before insert or update of phone, primary_type, types, discovered_website
  on public.leads
  for each row
  execute function calculate_lead_score();
