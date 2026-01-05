# frozen_string_literal: true

class Public::Users::RegistrationsController < Devise::RegistrationsController
  before_action :ensure_normal_user, only: [:edit, :update, :destroy]
  # before_action :configure_sign_up_params, only: [:create]
  # before_action :configure_account_update_params, only: [:update]

  # GET /resource/sign_up
  # def new
  #   super
  # end

  # POST /resource
  # def create
  #   super
  # end

  # GET /resource/edit
  # def edit
  #   super
  # end

  # PUT /resource
  # def update
  #   super
  # end

  # DELETE /resource
  # def destroy
  #   super
  # end

  # GET /resource/cancel
  # Forces the session data which is usually expired after sign
  # in to be expired now. This is useful if the user wants to
  # cancel oauth signing in/up in the middle of the process,
  # removing all OAuth session data.
  # def cancel
  #   super
  # end

  protected

  # 編集画面のパスワード入力を不要とする処理
  def update_resource(resource, params)
    if params[:password].blank? && params[:password_confirmation].blank?
      resource.update_without_password(params.except(:current_password))
    else
      super
    end
  end

  def after_update_path_for(resource)
    user_path(resource)
  end

  #ゲストユーザーの編集・削除を禁止する処理
  def ensure_normal_user
    if resource.email == 'guest@example.com'
      flash[:alert] = "ゲストユーザーの編集・削除はできません。"
      redirect_to user_path(current_user)
    end
  end
  
end
