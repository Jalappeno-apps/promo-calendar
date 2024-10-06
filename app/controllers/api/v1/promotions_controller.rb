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

# warsaw = [
#   {
#     "latitude": 52.2354,
#     "longitude": 21.0205
#   },
#   {
#     "latitude": 52.2218,
#     "longitude": 21.0036
#   },
#   {
#     "latitude": 52.2431,
#     "longitude": 21.0149
#   },
#   {
#     "latitude": 52.2305,
#     "longitude": 21.0274
#   },
#   {
#     "latitude": 52.2396,
#     "longitude": 21.0007
#   },
#   {
#     "latitude": 52.2182,
#     "longitude": 21.0320
#   },
#   {
#     "latitude": 52.2249,
#     "longitude": 21.0153
#   },
#   {
#     "latitude": 52.2412,
#     "longitude": 20.9896
#   },
#   {
#     "latitude": 52.2176,
#     "longitude": 21.0231
#   },
#   {
#     "latitude": 52.2285,
#     "longitude": 21.0078
#   }
# ]


# krakow = [
#   {
#     "latitude": 50.0738,
#     "longitude": 19.9556
#   },
#   {
#     "latitude": 50.0612,
#     "longitude": 19.9295
#   },
#   {
#     "latitude": 50.0483,
#     "longitude": 19.9502
#   },
#   {
#     "latitude": 50.0705,
#     "longitude": 19.9331
#   },
#   {
#     "latitude": 50.0597,
#     "longitude": 19.9734
#   },
#   {
#     "latitude": 50.0541,
#     "longitude": 19.9187
#   },
#   {
#     "latitude": 50.0763,
#     "longitude": 19.9652
#   },
#   {
#     "latitude": 50.0679,
#     "longitude": 19.9870
#   },
#   {
#     "latitude": 50.0529,
#     "longitude": 19.9390
#   },
#   {
#     "latitude": 50.0791,
#     "longitude": 19.9495
#   }
# ]


# lodz = [
#   {
#     "latitude": 51.7493,
#     "longitude": 19.4670
#   },
#   {
#     "latitude": 51.7752,
#     "longitude": 19.4523
#   },
#   {
#     "latitude": 51.7619,
#     "longitude": 19.4395
#   },
#   {
#     "latitude": 51.7541,
#     "longitude": 19.4812
#   },
#   {
#     "latitude": 51.7449,
#     "longitude": 19.4621
#   },
#   {
#     "latitude": 51.7647,
#     "longitude": 19.4213
#   },
#   {
#     "latitude": 51.7725,
#     "longitude": 19.4938
#   },
#   {
#     "latitude": 51.7382,
#     "longitude": 19.4489
#   },
#   {
#     "latitude": 51.7694,
#     "longitude": 19.4716
#   },
#   {
#     "latitude": 51.7527,
#     "longitude": 19.4315
#   }
# ]
