class Store < ApplicationRecord
  has_many :promotions
  belongs_to :city, touch: true

  def self.ransackable_attributes(auth_object = nil)
    ["address", "contact", "created_at", "id", "id_value", "instagram", "menu_url", "name", "updated_at", "website"]
  end
end
