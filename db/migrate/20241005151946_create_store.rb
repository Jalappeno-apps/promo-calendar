class CreateStore < ActiveRecord::Migration[7.1]
  def change
    create_table :stores do |t|
      t.string :name
      t.string :address
      t.string :contact
      t.string :menu_url
      t.string :website
      t.string :instagram

      t.timestamps
    end
  end
end
