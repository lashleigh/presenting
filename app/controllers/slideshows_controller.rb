class SlideshowsController < ApplicationController
  def index
    if current_user 
      six = Slideshow.find('6')
      @yours = Slideshow.find_all_by_user_id(current_user.id)
      @all = Slideshow.all - six.to_a - @yours
      @add_new = six.content
    else
      @all = Slideshow.all
    end
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @slideshow }
    end
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

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @slideshow }
    end
  end

  def create 
    @slideshow = Slideshow.new(params[:slideshow])
    @slideshow.content = generate_blank_content() 
    @slideshow.version = 20
    @slideshow.user = current_user

    respond_to do |format|
      if @slideshow.save
        format.html { redirect_to(@slideshow, :notice => 'Slideshow was successfully created.') }
        format.xml  { render :xml => @slideshow, :status => :created, :location => @slideshow }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @slideshow.errors, :status => :unprocessable_entity }
      end
    end
  end

  def update
    @slideshow = Slideshow.find(params[:id])
    if current_user and @slideshow.user_id = current_user.id
      @slideshow.content = params[:content]
      @slideshow.version = params[:version]
      @slideshow.save
      respond_to do |format|
        format.html { render :text => "Success" }
        format.xml  { render :xml => @slideshow }
      end
    else
      respond_to do |format|
        format.html { render :text => "Failure, you are not the owner of this slideshow" }
        format.xml  { render :xml => @slideshow }
      end
    end
  end

  def generate_blank_content
    Slideshow.find('6').content
  end

end
