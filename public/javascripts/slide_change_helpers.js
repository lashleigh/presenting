var future_classes = "future reduced zoomed_in_slide slide_transition"
var far_future_classes = "far-future reduced zoomed_in_slide slide_transition"
var current_classes = "current zoomed_in_slide slide_transition"
var past_classes = "past reduced zoomed_in_slide slide_transition"
var far_past_classes = "far-past reduced zoomed_in_slide slide_transition"

function commonToSlideChange() {
  var id = $(".current").attr("id");
  $("#editor textarea").val(slides_hash[id].code);
  //code_editor.setCode(slides_hash[id].code);
  set_canvas(slides_hash[id]);
  var mini = $(".current").attr("id").replace("slide", "mini");
  $(".box").css("background", "white");
  $("#"+mini).css("background", "yellow");
}
function set_current(index) {
  var res = $(".slide").removeClass();
  res.addClass("slide");
  $($(".slide")[index]).addClass(current_classes)
  $($(".slide")[index+1]).addClass(future_classes)
  $($(".slide")[index-1]).addClass(past_classes)
  for( var i = 2; i < $(".slide").length; i++) {
    $($(".slide")[index+i]).addClass(far_future_classes)
  }
  for( var i = 0; i <= index - 2; i++) {
    $($(".slide")[i]).addClass(far_past_classes);
  }
  if($(".presentation").hasClass("coding_mode")) {
    $(".slide").removeClass("slide_transition");
    $(".current").addClass("small_float_right").removeClass("zoomed_in_slide");
  }
  commonToSlideChange();
}

function create_new_slide_at_end() {
  // Create Slide
  var slide = new Slide();
  $(".slides").append( slide_html(slide) );
  slides_hash[slide.slide_id()] = slide;
  $(".slide").removeClass("current")
  $("#slide_"+slide.id).addClass("current")
  create_canvas(slide);
  save_slides();

  // Update thumbnails and order arry to contain the new slide
  $("#boxes").append(box_html(slide));
  order.push("slide_"+slide.id);

  // Autopopulate with two placeholder notes.    
  header_note(slide);
  body_note(slide);
  clear_borders();
  save_order();
  save_notes();

  var index = $(".current").index(".slide");
  set_current(index);
}
