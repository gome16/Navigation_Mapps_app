class Public::UsersController < ApplicationController
  def show
    @user = User.find(params[:id])
  end

    #退会確認画面
  def unsubscribe
    @user = current_user
  end

  #退会用アクション
  def withdraw
    @user=current_user
    @user.update(is_deleted: true)
    reset_session
    flash[:notice] = "退会が完了しました" 
    redirect_to root_path
  end
end
