class AddRecurrenceFrequencyToPromotion < ActiveRecord::Migration[7.1]
  def change
    add_column :promotions, :recurrence_frequency, :integer
  end
end
