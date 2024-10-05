class UpdateRecurringToBoolean < ActiveRecord::Migration[7.1]
  def change
    remove_column :promotions, :recurring
    add_column :promotions, :recurring, :boolean, default: false
  end
end
