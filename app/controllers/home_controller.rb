class HomeController < ApplicationController
  def preview 
    @content = Preview.find_by_id('1').content
    render :layout => "preview" 
  end

  def index
    if current_user
      @all = Slideshow.find_all_by_user_id(current_user.id)
    end
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @slideshow }
    end
  end

end
