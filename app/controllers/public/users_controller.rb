class Public::UsersController < ApplicationController
  def show
    @user = User.find(params[:id])
    @posts = @user.posts.order(created_at: :desc)
  end

  # 詳細画面の地図表示
  def posts
    user = User.find(params[:user_id])
    posts = user.posts

    render json: posts.map { |post|
        {
        id: post.id,
        title: post.title,
        latitude: post.latitude,
        longitude: post.longitude
        }
      }
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
