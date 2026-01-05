class Public::UsersController < ApplicationController
  before_action :ensure_normal_user, only: [:unsubscribe, :withdraw]

  def show
    @user = User.find(params[:id])
    @posts = @user.posts
      .order(updated_at: :desc)
      .page(params[:page])
      .per(5)
  end

  # 本番環境でのgooglemap_APIの500エラー回避
  def posts_json
    user = User.find(params[:id])
    posts = user.posts.order(updated_at: :desc)

    render json: posts.as_json(
      only: [:id, :title, :latitude, :longitude, :created_at, :updated_at]
    )
  end

  # 詳細画面の地図表示
  def posts
    user = User.find(params[:id])

    posts = user.posts
                .order(updated_at: :desc)
                .page(params[:page])
                .per(5)

    render json: posts.as_json(
      only: [:id, :title, :latitude, :longitude, :created_at, :updated_at]
    )
  end


    #退会確認画面
  def unsubscribe
    @user = current_user
  end

  #退会用アクション
  def withdraw
    @user = current_user
    @user.update(is_deleted: true)
    current_user.posts.destroy_all
    reset_session
    flash[:alert] = "退会が完了しました" 
    redirect_to root_path
  end

  protected
  
  #ゲストユーザーの編集・削除を禁止する処理
  def ensure_normal_user
    if resource.email == 'guest@example.com'
      flash.now[:notice] = "ゲストユーザーの削除はできません。"
      render show
    end
  end
end
