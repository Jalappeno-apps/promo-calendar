class Api::V1::PromotionsController < ApplicationController
  before_action :city
  before_action :locale

  def index
    if @city.present?
      @promotions = @city.promotions
    else
      @promotions = Promotion.all
    end

    @non_recurring_promotions = @promotions.where(
      starts_at: Date.today.beginning_of_week..1.month.from_now,
      recurring: false
    )

    @recurring_promotions = @promotions.where(
      starts_at: Date.today.beginning_of_week..1.month.from_now,
      recurring: true
    ).map do |promotion|
      promotion.events(Date.today.beginning_of_week, 1.month.from_now).map do |promo_datetime|
        promotion.dup.tap do |promo|
          promo.starts_at = promo_datetime
        end
      end
    end.flatten

    @promotions = @non_recurring_promotions + @recurring_promotions
  end

  private

  def city
    @city ||= City.find(params[:city_id])
  end

  def locale
    @locale = begin
      if params[:locale] == 'undefined'
       :en
      else
        params[:locale]&.to_sym || :en
      end
    end
  end
end
