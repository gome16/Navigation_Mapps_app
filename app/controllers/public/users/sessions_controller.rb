# frozen_string_literal: true

class Public::Users::SessionsController < Devise::SessionsController
  # before_action :configure_sign_in_params, only: [:create]
   before_action :reject_deleted_user, only: [:create]

  #  退会したアカウントでログインした際に新規登録画面へ遷移する処理
   def reject_deleted_user
    @user = User.find_by(email: params[:user][:email])
    if @user
      if @user.valid_password?(params[:user][:password]) && @user.is_deleted == true
        flash[:notice] = "このアカウントは退会済みです"
        redirect_to new_user_registration_path
      end
    end
  end

  # GET /resource/sign_in
  # def new
  #   super
  # end

  # POST /resource/sign_in
  # def create
  #   super
  # end

  # DELETE /resource/sign_out
  # def destroy
  #   super
  # end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
  # end
end
