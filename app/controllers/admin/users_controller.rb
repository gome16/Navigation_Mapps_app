class Admin::UsersController < Admin::BaseController
  def index
    @users = User.page(params[:page])
  end

  def show
  end

  def edit
  end

  def update
  end

  def destroy
  end
end
