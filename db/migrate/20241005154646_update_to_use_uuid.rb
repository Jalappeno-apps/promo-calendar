class UpdateToUseUuid < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :uuid, :uuid, default: "gen_random_uuid()", null: false
    add_column :stores, :uuid, :uuid, default: "gen_random_uuid()", null: false
    add_column :promotions, :uuid, :uuid, default: "gen_random_uuid()", null: false

    change_table :users do |t|
      t.remove :id
      t.rename :uuid, :id
    end
    execute "ALTER TABLE users ADD PRIMARY KEY (id);"

    change_table :stores do |t|
      t.remove :id
      t.rename :uuid, :id
    end
    execute "ALTER TABLE stores ADD PRIMARY KEY (id);"

    change_table :promotions do |t|
      t.remove :id
      t.rename :uuid, :id
    end
    execute "ALTER TABLE promotions ADD PRIMARY KEY (id);"

    add_column :promotions, :store_id, :uuid
  end
end
