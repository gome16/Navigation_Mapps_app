class Post < ApplicationRecord

  belongs_to :user

  validates :title, presence: true
  
  # geocoder関係
  geocoded_by :address
  after_validation :geocode
end
