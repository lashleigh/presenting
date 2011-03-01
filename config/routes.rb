Presenting::Application.routes.draw do

  resources :slideshows
  post "update" => "slideshows#update", :as => "update"

  match "/auth/:provider/callback" => "sessions#create"  
  match "/auth/failure" => "sessions#failure"  

  match "/signout" => "sessions#destroy", :as => :signout  

  root :to => "slideshows#index"

end
