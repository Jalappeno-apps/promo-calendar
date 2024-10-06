json.array! @cities do |city|
  json.id city.id
  json.title city.title
  json.coordinates city.coordinates
end
