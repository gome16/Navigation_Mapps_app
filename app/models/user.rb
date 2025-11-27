class User < ApplicationRecord

  has_many :posts, dependent: :destroy
  has_one_attached :profile_image

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  #　プロフィールイメージフォント調整  
  def get_profile_image(width, height)
    unless profile_image.attached?
      file_path = Rails.root.join('app/assets/images/default_profile.jpg')
      profile_image.attach(io: File.open(file_path), filename: 'default_profile.jpg', content_type: 'image/jpeg')
    end
      profile_image.variant(resize_to_limit: [width, height]).processed
  end
end
