class City < ApplicationRecord
  has_many :stores

  validates :title, presence: true
  has_many :promotions, through: :stores
end
