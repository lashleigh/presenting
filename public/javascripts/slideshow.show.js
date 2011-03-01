var raphael_papers = {}, d3_papers = {};
var scale = .4;

$(function() {
  if( $("#covers")) {
    for(i in all) {
      var ss = JSON.parse(all[i].slideshow.content);
      var first_slide = ss.slides[ss.order[0]];
      $("#covers").append(slide_html(first_slide));
      create_canvas(first_slide);
      for(n_id in first_slide.notes) {
        make_a_note(first_slide.notes[n_id]);
      }
      $($(".slide_number")[i]).html(all[i].slideshow.id);
      $("#slide_"+first_slide.id).wrap('<a href="/slideshows/'+all[i].slideshow.id+'/" class="expose" />');
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


