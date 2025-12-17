class ApplicationController < ActionController::Base
  before_action :configure_permitted_parameters, if: :devise_controller?
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:user_name, :profile, :profile_image])
    devise_parameter_sanitizer.permit(:account_update, keys: [:user_name, :profile, :profile_image])
  end

  def record_not_found
    redirect_to posts_path, alert: "投稿は削除済みです"
  end

   # サインイン後の遷移先指定
  def after_sign_in_path_for(resource)
    posts_path
  end
end
