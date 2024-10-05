class Api::V1::PromotionsController < ApplicationController
  def index
    @promotions = Promotion.where(
      starts_at: Date.today.beginning_of_week..1.month.from_now,
      recurring: false
    )

    @recurring_promotions = Promotion.where(
      starts_at: Date.today.beginning_of_week..1.month.from_now,
      recurring: true
    ).map do |promotion|
      promotion.events(Date.today.beginning_of_week, 1.month.from_now).map do |promo_datetime|
        promotion.dup.tap do |promo|
          promo.starts_at = promo_datetime
        end
      end
    end.flatten

    @promotions = @promotions + @recurring_promotions
  end
end
