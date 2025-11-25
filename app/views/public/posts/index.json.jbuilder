json.data do
  json.posts @posts do |post|
    json.id post.id

    json.user do
      json.id post.user.id 
      json.name post.user.user_name
      json.image url_for(post.user.profile_image) if post.user.profile_image.attached?
      json.url user_path(post.user)
    end

    json.address post.address
    json.latitude post.latitude
    json.longitude post.longitude
    json.title post.title
    json.id post.id
    json.url post_path(post)
  end
end
