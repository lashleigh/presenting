class HomeController < ApplicationController
  def preview 
    @content = Preview.find_by_id('1').content
    render :layout => "preview" 
  end

  def index
    @slideshow = Slideshow.find('4')
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @slideshow }
    end
  end

end
