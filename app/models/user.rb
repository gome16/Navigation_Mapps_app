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

  # ゲストログイン用メソッド
  def self.guest
    find_or_create_by!(email: 'guest@example.com') do |user|
      user.password = SecureRandom.urlsafe_base64
      user.user_name = "ゲストユーザー"
      user.profile = <<~TEXT
        このアカウントはゲストユーザー用アカウントです。
        どなたでもご利用できます。
        ゲストアカウントの編集・削除はできません。
      TEXT
    end
  end
end
