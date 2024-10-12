# frozen_string_literal: true

module Locales
  extend ActiveSupport::Concern

  included do
    before_action :set_locale
  end

  def set_locale
    locale = choose_locale
    locale = :en unless locale&.to_sym&.in?(I18n.available_locales)

    I18n.locale = locale

    cookies[:locale] = locale if locale != cookies[:locale]
  end

  # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
  def choose_locale
    i18n_from_param = params[:locale]&.to_sym
    return i18n_from_param if i18n_from_param.in?(I18n.available_locales)

    i18n_from_cookie = cookies[:locale]&.to_sym
    return i18n_from_cookie if i18n_from_cookie.in?(I18n.available_locales)

  rescue NameError
    :en
  end

  # rubocop:enable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity

  def default_url_options
    { locale: I18n.locale }
  end

  def self.default_url_options(options = {}) # rubocop:disable Style/OptionHash
    options.merge(locale: I18n.locale)
  end
end
