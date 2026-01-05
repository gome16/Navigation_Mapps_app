# frozen_string_literal: true

class Public::Users::SessionsController < Devise::SessionsController
  before_action :reject_deleted_user, only: [:create]

  # 退会したアカウントでログインした際に新規登録画面へ遷移する処理
  def reject_deleted_user
    @user = User.find_by(email: params[:user][:email])
    if @user
      if @user.valid_password?(params[:user][:password]) && @user.is_deleted == true
        flash[:alert] = "このアカウントは退会済みです"
        redirect_to new_user_registration_path
      end
    end
  end   # ← ★ ここで閉じる（超重要）

  # ゲストユーザーログイン
  def guest_sign_in
    user = User.guest
    sign_in user
    flash[:notice] = "ゲストユーザーとしてログインしました。"
    redirect_to posts_path
  end
end
