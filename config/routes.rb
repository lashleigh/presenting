Presenting::Application.routes.draw do
  get "home/index"
  get "home/preview"

  resources :slideshows
  post "update" => "slideshows#update", :as => "update"
  match "/auth/:provider/callback" => "sessions#create"  
  match "/signout" => "sessions#destroy", :as => :signout  

  root :to => "home#index"

end
