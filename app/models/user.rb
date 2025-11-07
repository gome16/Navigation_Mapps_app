class User < ApplicationRecord
  
  has_one_attached :profile_image

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
end
