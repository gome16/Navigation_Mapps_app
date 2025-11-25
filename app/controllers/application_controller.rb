class ApplicationController < ActionController::Base
  before_action :configure_permitted_parameters, if: :devise_controller?

  # サインイン後の遷移先指定
  def after_sign_in_path_for(resource)
    posts_path
  end

  # サインイン後の遷移先指定
  def after_sign_up_path_for(resource)
    posts_path
  end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:user_name, :profile, :profile_image])
    devise_parameter_sanitizer.permit(:account_update, keys: [:user_name, :profile, :profile_image])
  end
end
