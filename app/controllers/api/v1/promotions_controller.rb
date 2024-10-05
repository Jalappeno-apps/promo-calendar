class Api::V1::PromotionsController < ApplicationController
  def index
    @promotions = Promotion.all
    render json: @promotions
  end
end

# setPromotions([
#       {
#         id: 1,
#         store: 'Store A',
#         type: 'Discount',
#         start: '2024-10-07T10:00:00',
#         end: '2024-10-07T18:00:00',
#         title: '20% off all items',
#         description: 'Get 20% off on all items in Store A. Limited time offer!',
#       },
#       {
#         id: 2,
#         store: 'Store B',
#         type: 'BOGO',
#         start: '2024-10-08T09:00:00',
#         end: '2024-10-08T17:00:00',
#         title: 'Buy one, get one free',
#         description: 'Purchase any item and get another of equal or lesser value for free at Store B.',
#       },
#       // ... more promotions