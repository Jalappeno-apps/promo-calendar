class Api::V1::CitiesController < ApplicationController
  def index
    @cities = City.all
  end
end
