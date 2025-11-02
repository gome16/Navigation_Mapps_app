Rails.application.routes.draw do

  devise_for :users,skip: [:passwords],
    controllers: {
      sessions: 'public/users/sessions',
      registrations: 'public/users/registrations',
    }

  namespace :public do
    resources :users, only: [:show]
  end

  root to: "homes#top"
  get 'homes/about'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
