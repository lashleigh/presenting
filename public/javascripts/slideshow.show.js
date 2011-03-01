var raphael_papers = {}, d3_papers = {};
var all_shows = {};
var scale = .4;

$(function() {
  $("body").css("overflow", "auto");
  read_shows();
  for(show_id in all_shows) {
    set_initial(show_id, 0);
  }
  if(typeof add_new != "undefined") {
    add_new = JSON.parse(add_new);
    var new_slide = add_new.slides[add_new.order[0]];
    $("#covers").append(gridify_slide_html(new_slide))
    create_canvas(new_slide);
    for(n_id in new_slide.notes) {
      make_a_note(new_slide.notes[n_id]);
    }
    $(".slide").last().attr("id", "slide_new");
    $("#slide_new").wrap('<a href="/slideshows/new/" class="expose" id="new" />');
    $("#slide_new .slide_number").remove();
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
  create_canvas(visible_slide);
  for(n_id in visible_slide.notes) {
    make_a_note(visible_slide.notes[n_id]);
  }
  clear_borders();
  $("#slide_"+visible_slide.id+" .slide_number").html(index);
  this_show.visible_index = index;
}
function set_initial(show_id, index) {
  var this_show = all_shows[show_id];
  var visible_slide = this_show.slides[this_show.order[index]];
  visible_slide.visible_index = index;
  $("#expose_"+visible_slide.id).remove();
  $("#covers").append(gridify_slide_html(visible_slide));
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

function gridify_slide_html(slide) {
    return '<div id="slide_'+slide.id+'" class="slide gridify">'+
              '<div id="d3_'+slide.id+'" class="d3_container"> </div>'+
              '<div id="raphael_'+slide.id+'" class="raphael_container notes_container"> </div>'+
              '<div class="slide_number"></div>'+
           '</div>'

}
