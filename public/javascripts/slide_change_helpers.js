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
  update_numbering();
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
  $(".slide").css('-webkit-transform',"");
  $(".slide").css('margin-right', "");
  if($(".presentation").hasClass("coding_mode")) {
    $(".slide").removeClass("slide_transition");
    $(".current").addClass("small_float_right").removeClass("zoomed_in_slide");
    
    var scale = $("#face-rounded-border").val() / 100;
    var margin_right = (-1)*(slideWidth*(1-scale)/2);
    $(".current").css('-webkit-transform','scale('+scale+')');
    $(".current").css('margin-right', margin_right+'px');
  }
  commonToSlideChange();
}
function update_numbering() {
  for(var i=0; i< $(".slides .slide").size(); i++) {
    $($(".slide .slide_number")[i]).html(i+1);
    $($("#boxes .box")[i]).html(i+1);
  }
  var mini = $(".current").attr("id").replace("slide", "mini");
  $(".box").css("background", "white");
  $("#"+mini).css("background", "yellow");
  set_and_run_code($(".current"));
}
function create_new_slide_at_end() {
  // Create Slide
  var slide = new Slide();
  $(".slides").append( slide_html(slide) );
  slides_hash[slide.slide_id()] = slide;
  $(".slide").removeClass("current")
  $("#"+slide.slide_id()).addClass("current")
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

function duplicate_current_slide() {
  var current = $(".current");
  var current_notes = $(".current .note");
  var id = current.attr("id");
  var box_id = id.replace("slide", "mini");
  var slide = new Slide();
  var hash_id = slide.slide_id();
  slide.code = slides_hash[id].code;
  slides_hash[hash_id] = slide;
  
  var box_index = $("#"+box_id).index();
  order.splice(box_index+1, 0, "slide_"+slide.id); //Inserts the duplicate after the original
  $(slide_html(slide)).insertAfter(current);
  $(box_html(slide)).insertAfter($("#"+box_id))
  $("#"+slide.slide_id()).addClass("current")
  current.removeClass("current").addClass("past reduced");
  current.prev().removeClass("past").addClass("far-past")

  $("#editor textarea").val(slides_hash[hash_id].code);
  create_canvas(slide);

  // Duplication of notes is trickier
  var number_of_notes = current_notes.size()
  for(var i = 0; i < number_of_notes; i++) {
    var note = new Note();
    var copy_from_id = $(current_notes[i]).attr("id");
    var copied_note = notes_hash[copy_from_id];
       note.top = copied_note.top;
       note.left = copied_note.left;
       note.width = copied_note.width;
       note.height = copied_note.height;
       note.content = copied_note.content;
       note.slide_id = hash_id;
       while(notes_hash[note.note_id()] != null) { 
         note.id++; 
       }
       notes_hash[note.note_id()] = note;
       make_a_note(note);
  }
  clear_borders();
  save_notes();
  save_order();
  save_slides();
  update_numbering();
}

function delete_current_slide() {
  var current = $(".current");
  var index = current.index(".slide");
  if( current.next().hasClass("slide") ) {
    current.remove();
    set_current(index);
  } else if ( current.prev().hasClass("slide") ) {
    current.remove();
    set_current(index-1);
  } else {
    // TODO What should happen if there are no slides?
  }

  var id = current.attr("id");
  var box_id = id.replace("slide", "mini");
  var box_index = $("#"+box_id).index();
  order.splice(box_index, 1);
  save_order();
  
  delete slides_hash[id];
  save_slides();
  $("#"+box_id).remove();
  delete_inactive_notes();
  set_and_run_code($(".current"));
  update_numbering();
}
