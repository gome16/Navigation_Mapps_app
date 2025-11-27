json.post do
  json.id @post.id
  json.title @post.title
  json.comment @post.comment
  json.address @post.address
  json.latitude @post.latitude
  json.longitude @post.longitude

  json.user do
    json.id @post.user.id
    json.name @post.user.user_name
    json.image url_for(@post.user.profile_image) if @post.user.profile_image.attached?
  end
end
