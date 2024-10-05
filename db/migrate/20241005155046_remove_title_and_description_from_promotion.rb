class RemoveTitleAndDescriptionFromPromotion < ActiveRecord::Migration[7.1]
  def change
    remove_column :promotions, :title
    remove_column :promotions, :description
  end
end
