class Promotion < ApplicationRecord
  extend Mobility

  enum recurrence_frequency: { weekly: 0, biweekly: 1, monthly: 2, annually: 3, daily: 4 }

  belongs_to :store
  translates :title, :description
  validates :starts_at, presence: true

  delegate :name, to: :store
  alias :store_name :name 

  def to_builder
    Jbuilder.new do |promotion|
      promotion.(self, :store_name)
    end
  end

  def schedule
    @schedule ||= begin
      schedule = IceCube::Schedule.new(now = starts_at)
      case recurrence_frequency
      when 'daily'
        schedule.add_recurrence_rule IceCube::Rule.daily(1)
      when 'weekly'
        schedule.add_recurrence_rule IceCube::Rule.weekly(1)
      when 'biweekly'
        schedule.add_recurrence_rule IceCube::Rule.weekly(2)
      when 'monthly'
        schedule.add_recurrence_rule IceCube::Rule.monthly(1)
      when 'annually'
        schedule.add_recurrence_rule IceCube::Rule.yearly(1)
      end
      schedule
    end
  end

  def events(start_date, end_date)
    start_frequency = start_date ? start_date.to_date : Date.today - 1.year
    end_frequency = end_date ? end_date.to_date : Date.today + 1.year
    schedule.occurrences_between(start_frequency, end_frequency)
  end
end
