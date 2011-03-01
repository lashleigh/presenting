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

function make_a_note(note) {
  $("#"+note.slide_id+" .notes_container").append(note_html(note));
}
function note_html(note) {
    return '<div id="note_'+note.id+'" class="note editable" style="'+get_style(note)+'">'+
                              '<div class="preview">'+linen(note.content)+'</div>'+
                              '<textarea class="edit_area" style="width:'+note.width+'px;height:'+note.height+'px;"  >'+note.content+'</textarea>'+
                              '</div>'
}
function slide_html(slide) {
    return '<div id="slide_'+slide.id+'" class="slide zoomed_in_slide slide_transition">'+
              '<div id="d3_'+slide.id+'" class="d3_container"> </div>'+
              '<div id="raphael_'+slide.id+'" class="raphael_container notes_container"> </div>'+
              '<div class="slide_number">'+($(".slide").size()+1)+'</div>'+
           '</div>'
}
function create_canvas(slide) {
  d3_papers[slide.id] = d3.select("#d3_"+slide.id);
  var raphael_id = "raphael_"+slide.id;
  raphael_papers[slide.id] = Raphael(raphael_id, $(".slide").width(), $(".slide").height());//, dashed = {fill: "none", stroke: "#666", "stroke-dasharray": "- "};;
 
  set_canvas(slide);
}
function set_canvas(slide) {
  var paper = raphael_papers[slide.id];
  var d3_paper = d3_papers[slide.id];
  paper.clear();
  $("#d3_"+slide.id).empty();
  try {
    (new Function("paper", "d3_paper", "window", "document", slide.code ) ).call(paper, paper, d3_paper);
  } catch (e) {
    alert(e.message || e);
  }
}
