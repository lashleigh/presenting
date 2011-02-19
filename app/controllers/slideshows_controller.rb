class SlideshowsController < ApplicationController
  def index
  end

  def show
    @slideshow = Slideshow.find(params[:id])
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @slideshow }
    end
  end

  def new
    @slideshow = Slideshow.new
    @slideshow.title = params[:title]
    @slideshow.content = params[:content]
    @slideshow.save

    respond_to do |format|
      format.html { render :text => "Success" }
      format.xml  { render :xml => @slideshow }

    end
  end

  def update
    @slideshow = Slideshow.find_or_create_by_id(params[:id])
    @slideshow.title = params[:title]
    @slideshow.content = params[:content]
    @slideshow.version = params[:version]
    @slideshow.save

    respond_to do |format|
      format.html { render :text => "Success" }
      format.xml  { render :xml => @slideshow }

    end
  end
end
