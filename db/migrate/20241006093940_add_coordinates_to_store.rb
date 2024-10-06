class AddCoordinatesToStore < ActiveRecord::Migration[7.1]
  def change
    add_column :stores, :coordinates, :jsonb, default: {lat: 0, lng: 0}
  end
end
