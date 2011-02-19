class HomeController < ApplicationController
  def preview 
    @content = Preview.find_by_id('1').content
    render :layout => "preview" 
  end

  def index
  end

end
