function handleCorner(event) {
    var border = $("#scale-slider").val();
    var scale = border / 100;
    var width = $(".current").width();
    var margin_right = (-1)*(width*(1-scale)/2);
    var exact_scale = parseFloat($($(".current").css("-webkit-transform").split(","))[0].split("(")[1]);
    var editor_width = screen.availWidth - 10 - $(".current").width()*exact_scale;
    $(".current").css('-webkit-transform','scale('+scale+')');
    $(".current").css('margin-right', margin_right+'px');
    $("#editor").css('width', editor_width+'px');
}

// Helpers primarily related to notes
//
function header_note(slide) {
   var header_note = new Note();
   header_note.top = 0;
   header_note.left = 0;
   header_note.width = slideWidth;
   header_note.height = 200;
   header_note.content = "h1. Header holder";
   header_note.slide_id = "slide_"+slide.id;
   while(notes_hash[header_note.note_id()] != null) {
     header_note.id++;
   }
   notes_hash[header_note.note_id()] = header_note;
   make_a_note(header_note);
}

function body_note(slide) {
  var body_note = new Note();
   body_note.top = 220;
   body_note.left = 0;
   body_note.width = slideWidth;
   body_note.height = slideHeight - body_note.top;
   body_note.content = "p(pink). paragraphs here";
   body_note.slide_id = "slide_"+slide.id;
   while(notes_hash[body_note.note_id()] != null) {
     body_note.id++;
   }
   notes_hash[body_note.note_id()] = body_note;
   make_a_note(body_note);
}

function get_style(note) {
  var style = "position:absolute;width:"+note.width+"px;height:"+note.height+'px;top:'+note.top+'px;left:'+note.left+'px;';
  return style;
}
function show_borders_this_red(note) {
  $(".note").css("border-color", "rgba(25, 25, 25, 0.5)");
  $(note).css("border-color", "rgba(255, 25, 25, 0.8)");
}
function clear_borders() {
  $(".note").css("border-color", "rgba(25, 25, 25, 0.0)");
  $(".info").hide();
}
function grey_border(note) {
  $(note).css("border-color", "rgba(55, 25, 25, 0.8)");
}
function prettify() {
  //$("pre").addClass("prettyprint");
  $("code").addClass("prettyprint");
  prettyPrint();
}


