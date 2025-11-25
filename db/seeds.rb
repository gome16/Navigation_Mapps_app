# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
Post.find_or_create_by!(shop_name: "Cavello") do |post|
  post.address = "東京都千代田区丸の内1丁目" # 追記
  post.user_name = olivia
  post.title = タイトル１
end

Post.find_or_create_by!(shop_name: "和食屋せん") do |post|
  post.address = "愛知県名古屋市中村区名駅１丁目１−４" # 追記
  post.user = james
end

Post.find_or_create_by!(shop_name: "ShoreditchBar") do |post|
  post.address = "大阪府大阪市淀川区西中島5-16-1" # 追記
  post.user = lucas
end
