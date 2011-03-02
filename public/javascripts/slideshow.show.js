var raphael_papers = {}, d3_papers = {};
var all_shows = {};
var scale = .4;
var dim = {};

$(function() {
  $("body").css("overflow", "auto");
  read_shows();
  for(show_id in all_shows) {
    set_initial(show_id, 0);
  }
  if(add_new) {
    new_from_slideshow();
  }
  clear_borders();
  $(".notnew").live("mousemove", function(e) {
    var show_id = $(this).attr("id").split("_")[1]
    var this_show = all_shows["ss_"+show_id];
    var num_slides = this_show.num_slides;
    var pos = e.pageX - $(this).offset().left; 
    var hover_index = parseInt(pos*num_slides/$(this).width());
    if(hover_index != this_show.visible_index ) {
      change_visible_slide(this_show, hover_index);
    }
  });
});
function change_visible_slide(this_show, index) {
  var visible_slide = this_show.slides[this_show.order[index]];
  $("#expose_"+this_show.id).html(gridify_slide_html(visible_slide));
  for(n_id in visible_slide.notes) {
    make_a_note(visible_slide.notes[n_id]);
  }
  create_canvas(visible_slide);
  clear_borders();
  $("#slide_"+visible_slide.id+" .slide_number").html(index);
  this_show.visible_index = index;
}
function set_initial(show_id, index) {
  var this_show = all_shows[show_id];
  var visible_slide = this_show.slides[this_show.order[index]];
  visible_slide.visible_index = index;
  $("#expose_"+visible_slide.id).remove();
  $("#user_thumbnails").append(gridify_slide_html(visible_slide));
  for(n_id in visible_slide.notes) {
    make_a_note(visible_slide.notes[n_id]);
  }
  dim.width = all_shows[show_id].width;
  dim.height = all_shows[show_id].height;
  create_canvas(visible_slide);
  $("#slide_"+visible_slide.id).wrap('<a href="/slideshows/'+this_show.id+'/" class="expose notnew" id="expose_'+this_show.id+'" />');
  $("#slide_"+visible_slide.id+" .slide_number").html(index);
}

function read_shows() {
  for(var i = 0; i < yours.length; i++) {
    all_shows["ss_"+yours[i].slideshow.id] = JSON.parse(yours[i].slideshow.content);
    all_shows["ss_"+yours[i].slideshow.id].title = yours[i].slideshow.title;
    all_shows["ss_"+yours[i].slideshow.id].position = i;
    all_shows["ss_"+yours[i].slideshow.id].id = yours[i].slideshow.id;
    all_shows["ss_"+yours[i].slideshow.id].visible_index = 0;
  }
  for(var s in all_shows) {
    all_shows[s].num_slides = all_shows[s].order.length;
    all_shows[s].width  = all_shows[s].width;
    all_shows[s].height = all_shows[s].height;
  }
}

function gridify_slide_html(slide) {
    return '<div id="slide_'+slide.id+'" class="slide gridify">'+
              '<div id="d3_'+slide.id+'" class="d3_container"> </div>'+
              '<div id="raphael_'+slide.id+'" class="raphael_container notes_container"> </div>'+
              '<div class="slide_number"></div>'+
           '</div>'

}

function set_new() {
  $(".make_new").css({color: "black", 
               "text-shadow": "rgba(0, 0, 0, 0.5) 5px 5px 2px"});
  var w = dim.width*scale;
  var h = dim.height*scale;
  $(".make_new").bind("mousemove", function(e) {
    var posx = e.pageX - $(this).offset().left;
    var posy = e.pageY - $(this).offset().top;
    var xoff = -(posx-w/2)*40/w;
    var yoff = -(posy-h/2)*40/h;
    var offset = Math.abs((Math.round(xoff)?xoff:5)*(Math.round(yoff)?yoff:5));
    $(".make_new").css("text-shadow",
                "rgba(0, 0, 0, 0.5) "+xoff+"px "+yoff+"px +"+
                     Math.log(offset)+"px");  
  });
}
function new_from_slideshow() {
  add_new_slides = JSON.parse(add_new.slideshow.content);
  var new_slide = add_new_slides.slides[add_new_slides.order[0]];
  $("#new_slideshow").append(gridify_slide_html(new_slide))
  for(n_id in new_slide.notes) {
    make_a_note(new_slide.notes[n_id]);
  }
  $("#slide_1299017729547_6").addClass("slide_new");
  $(".slide_new").wrap('<a href="/slideshows/new/" class="new_slideshow" id="new" />');
  $("#new .slide_number").remove();
  dim.width = add_new.slideshow.width;
  dim.height = add_new.slideshow.height;
  console.log(dim);
  create_canvas(new_slide);
}
