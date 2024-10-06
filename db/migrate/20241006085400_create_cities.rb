class CreateCities < ActiveRecord::Migration[7.1]
  def change
    create_table :cities, id: :uuid do |t|
      t.string :title
      t.jsonb :coordinates, default: { lat: 0, lng: 0 }
    end

    add_column :stores, :city_id, :uuid
  end
end
