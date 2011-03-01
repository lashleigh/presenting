var raphael_papers = {}, d3_papers = {};
var all_shows = {};
var scale = .4;

$(function() {
  read_shows();
  for(show_id in all_shows) {
    set_initial(show_id, 0);
  }
  add_empty_new();
  clear_borders();
  $(".slide").removeClass("current reduced zoomed_in_slide slide_transition future far-future past far-past");
  $(".slide").addClass("gridify");

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
  $("#expose_"+this_show.id).empty();
  $("#expose_"+this_show.id).append(slide_html(visible_slide));
  create_canvas(visible_slide);
  for(n_id in visible_slide.notes) {
    make_a_note(visible_slide.notes[n_id]);
  }
  clear_borders();
  $("#slide_"+visible_slide.id).removeClass("current reduced zoomed_in_slide slide_transition future far-future past far-past");
  $("#slide_"+visible_slide.id).addClass("gridify");
  $("#slide_"+visible_slide.id+" .slide_number").html(index);
  this_show.visible_index = index;
}
function set_initial(show_id, index) {
  var this_show = all_shows[show_id];
  var visible_slide = this_show.slides[this_show.order[index]];
  visible_slide.visible_index = index;
  $("#expose_"+visible_slide.id).remove();
  $("#covers").append(slide_html(visible_slide));
  create_canvas(visible_slide);
  for(n_id in visible_slide.notes) {
    make_a_note(visible_slide.notes[n_id]);
  }
  $("#slide_"+visible_slide.id).wrap('<a href="/slideshows/'+this_show.id+'/" class="expose notnew" id="expose_'+this_show.id+'" />');
  $("#slide_"+visible_slide.id+" .slide_number").html(index);
}

function read_shows() {
  for(var i = 0; i < all.length; i++) {
    all_shows["ss_"+all[i].slideshow.id] = JSON.parse(all[i].slideshow.content);
    all_shows["ss_"+all[i].slideshow.id].title = all[i].slideshow.title;
    all_shows["ss_"+all[i].slideshow.id].position = i;
    all_shows["ss_"+all[i].slideshow.id].id = all[i].slideshow.id;
    all_shows["ss_"+all[i].slideshow.id].visible_index = 0;
  }
  for(var s in all_shows) {
    all_shows[s].num_slides = all_shows[s].order.length;
  }
}

function add_empty_new() {
  $("#covers").append('<div id="slide_new" class="slide"><h1>New</h1></div>')
  $("#slide_new").wrap('<a href="/slideshows/new/" class="expose" id="new" />');
}
