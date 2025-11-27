Rails.application.routes.draw do

  devise_for :users,
    controllers: {
      sessions: 'public/users/sessions',
      registrations: 'public/users/registrations',
    }

  scope module: :public do
    resources :users, only: [:show, :edit] do
      collection do
        get "unsubscribe"
        patch "withdraw"
      end

      get "posts", to: "users#posts"
    end

    resources :posts
    
    root to: "homes#top"
    get 'homes/about'
  end
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
