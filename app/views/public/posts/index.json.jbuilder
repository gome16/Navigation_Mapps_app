json.data do
  json.posts @posts do |post|
    json.id post.id
    json.user do
      if post.user
        json.id post.user.id
        json.name post.user.user_name || "名無し"
        json.image url_for(post.user.profile_image) if post.user.profile_image&.attached?
        json.url user_path(post.user)
      else
        json.id nil
        json.name "名無し"
        json.image nil
        json.url nil
      end
    end

    json.address post.address || ""
    json.latitude post.latitude&.to_f || 35.681236
    json.longitude post.longitude&.to_f || 139.767125
    json.title post.title || "無題"
    json.created_at post.created_at
    json.updated_at post.updated_at
    json.url post_path(post)
  end
end
