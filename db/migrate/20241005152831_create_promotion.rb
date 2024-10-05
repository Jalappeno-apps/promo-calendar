class CreatePromotion < ActiveRecord::Migration[7.1]
  def change
    create_table :promotions do |t|
      t.string :title
      t.string :description
      t.datetime :starts_at
      t.datetime :ends_at
      t.integer :promotion_kind
      t.text :recurring

      t.timestamps
    end
  end
end
