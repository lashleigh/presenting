Rails.application.config.middleware.use OmniAuth::Builder do
  provider :twitter, 'Rfe4V4wJuhBJ2wd6QGHkUw', '5SkHaeREnpZsMbmYx6wWbAAuEgTTyQUqd6JF3WR2rQ'
  provider :facebook, '201071136585715', '38a56ba487633ba4c14f10be50467bb4'
  provider :open_id, nil
end

# you will be able to access the above providers by the following url
# /auth/providername for example /auth/twitter /auth/facebook

ActionController::Dispatcher.middleware do
  use OmniAuth::Strategies::OpenID,  nil, :name => "google",  :identifier => "https://www.google.com/accounts/o8/id"
  #use OmniAuth::Strategies::OpenID, OpenID::Store::Filesystem.new('/tmp'), :name => "yahoo",   :identifier => "https://me.yahoo.com"
  #use OmniAuth::Strategies::OpenID, OpenID::Store::Filesystem.new('/tmp'), :name => "aol",     :identifier => "https://openid.aol.com"
  #use OmniAuth::Strategies::OpenID, OpenID::Store::Filesystem.new('/tmp'), :name => "myspace", :identifier => "http://myspace.com"
end
# you won't be able to access the openid urls like /auth/google
# you will be able to access them through
# /auth/open_id?openid_url=https://www.google.com/accounts/o8/id
# /auth/open_id?openid_url=https://me.yahoo.com
