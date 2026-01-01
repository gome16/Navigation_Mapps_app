class Public::PostsController < ApplicationController
  before_action :authenticate_user!, only: %i[new create edit update destroy]
  before_action :set_post, only: %i[show]
  before_action :set_post_edit, only: %i[ edit update destroy]
  before_action :authorize_post!, only: [:edit, :update, :destroy]

  def index
    @posts = Post
    .order(updated_at: :desc)
    .page(params[:page])
    .per(5)

    respond_to do |format|
      format.html
      format.json
    end
  end

  def show
    # set_post で 定義
  end

  def new
    @post = Post.new
  end

  def create
    @post = Post.new(post_params)
    @post.user_id = current_user.id

    if @post.save
      redirect_to post_path(@post), notice: "投稿完了しました"
    else
      render :new
    end
  end

  def edit
    # set_post で 定義
  end

  def update
    if @post.update(post_params)
      redirect_to post_path(@post), notice: "変更されました"
    else
      render :edit
    end
  end

  def destroy
    @post.destroy
    redirect_to posts_path, alert: "投稿を削除しました"
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end

  def set_post_edit
    @post = current_user.posts.find(params[:id])
  end

  def authorize_post!
    unless @post.user == current_user
      redirect_to posts_path, alert: "権限がありません"
    end
  end

  def post_params
    params.require(:post).permit(:address, :title, :comment, :latitude, :longitude)
  end
end
