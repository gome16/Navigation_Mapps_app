class AddShapesToPosts < ActiveRecord::Migration[6.1]
  def change
    add_column :posts, :shapes, :json
  end
end
