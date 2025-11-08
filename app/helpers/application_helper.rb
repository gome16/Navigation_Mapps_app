module ApplicationHelper

  # プロフィール画像とデフォルト未設定の場合のデフォルト画像設定
  def profile_image_for(user, size: [150, 150])
    if user.profile_image.attached?
      image_tag user.profile_image.variant(resize_to_limit: size)
    else
      image_tag 'default_profile.jpg', size: "#{size[0]}x#{size[1]}"
    end
  end
end
