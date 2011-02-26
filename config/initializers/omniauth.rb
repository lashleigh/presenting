Rails.application.config.middleware.use OmniAuth::Builder do
  provider :twitter, 'Rfe4V4wJuhBJ2wd6QGHkUw', '5SkHaeREnpZsMbmYx6wWbAAuEgTTyQUqd6JF3WR2rQ'
  provider :facebook, '201071136585715', '38a56ba487633ba4c14f10be50467bb4'
end
