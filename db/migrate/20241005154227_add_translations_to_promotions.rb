class AddTranslationsToPromotions < ActiveRecord::Migration[7.1]
  def change
    add_column :promotions, :translations, :jsonb, default: {}
  end
end
