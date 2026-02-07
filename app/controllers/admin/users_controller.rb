class Admin::UsersController < Admin::BaseController
  def index
    @users = User.page(params[:page])
  end

  def toggle_deleted
    user = User.find(params[:id])
    user.update!(is_deleted: !user.is_deleted)
    redirect_to admin_users_path
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
