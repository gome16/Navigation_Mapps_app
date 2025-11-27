class Post < ApplicationRecord

  belongs_to :user

  # geocoder関係

  geocoded_by :address
  after_validation :geocode
end
