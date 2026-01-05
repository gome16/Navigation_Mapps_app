Rails.application.routes.draw do

  devise_for :users,
    controllers: {
      sessions: 'public/users/sessions',
      registrations: 'public/users/registrations',
    }

  scope module: :public do
    resources :users, only: [:show, :edit] do
      member do
        get :posts
      end

      collection do
        get :unsubscribe
        patch :withdraw
      end
    end

    resources :posts
    
    root to: "homes#top"
    get 'homes/about'

    #　ゲストログイン
    devise_scope :user do
       post 'users/guest_sign_in', to: 'users/sessions#guest_sign_in'
    end
  end
end
