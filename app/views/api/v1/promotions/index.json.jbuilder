json.array! @promotions do |promotion|
  json.id promotion.id
  json.title promotion.title
  json.description promotion.description
  json.start promotion.starts_at
  json.end promotion.ends_at
  json.storeName promotion.store_name
  json.translations promotion.translations
  json.recurring promotion.recurring
  json.recurrenceFrequency promotion.recurrence_frequency if promotion.recurring?
  json.storeCoordinates promotion.store.coordinates
  json.cityId promotion.store.city_id
  json.storeLink promotion.store.instagram
  json.menuLink promotion.store.instagram
  json.instagramLink promotion.store.instagram
end

