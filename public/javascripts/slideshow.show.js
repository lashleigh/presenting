var raphael_papers = {}, d3_papers = {};
var scale = .4;

$(function() {
  if( $("#covers")) {
    for(i in covers) {
      $("#covers").append(slide_html(covers[i].slide));
      create_canvas(covers[i].slide);
      for(j in covers[i].notes) {
        make_a_note(covers[i].notes[j]);
      }
      $($(".slide_number")[i]).html(all[i].slideshow.id);
      $("#slide_"+covers[i].slide.id).wrap('<a href="/slideshows/'+all[i].slideshow.id+'/" class="expose" />');
      $($(".expose")[i]).append('<div class="editable_title"><h1>'+all[i].slideshow.title+'</h1></div>');
    }
    $("#covers").append('<div id="new" class="slide"><h1>New</h1></div>')
    $("#new").wrap('<a href="/slideshows/new/" class="expose" />');
    clear_borders();
    $(".slide_number").hide();
    $(".slide").removeClass("current reduced zoomed_in_slide slide_transition future far-future past far-past");
    $(".slide").addClass("gridify");
  }

});


