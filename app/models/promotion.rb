class Promotion < ApplicationRecord
  extend Mobility

  belongs_to :store
  translates :title, :description

  delegate :name, to: :store
  alias :store_name :name 
end
