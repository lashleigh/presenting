var scale = 0.7;
var code_editor;
var which_db;
var local_version, order = [];
var uiLeft, uiTop, uiWidth, uiHeight;
var slideWidth, slideHeight, cylonOffset;
var slides_hash = {}, raphael_papers = {}, d3_papers = {};
$(function() {

  if( (typeof slideshow_hash != "undefined") && (slideshow_version > read_version()) ) {
    which_db = "using db version";
    slides_hash = slideshow_hash.slides;
    order = slideshow_hash.order;
    if(typeof order == "undefined") { read_order();}
    make_slides();
    local_version = parseInt(slideshow_version)+1;
  } else {
    which_db = "using local version";
    read_slides();
    read_order();
    make_slides();
  }
  slideWidth = $(".slide").width();
  slideHeight = $(".slide").height();

  var code_id = document.getElementById('code_mirror_textarea');
  code_editor = new CodeMirror.fromTextArea(code_id, {
    content: slides_hash[order[0]].code,
    parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
    stylesheet: "/javascripts/codemirror/css/jscolors.css",
    path: "/javascripts/codemirror/js/",
    autoMatchParens: true,
    width: "100%",
    height: "100%",
    saveFunction: function() {save_and_run_code();}
  });
  
  setTimeout( function() {
    set_current(0);
    //presentationMode();
    editingMode();
    var editor_width = document.width - 10 - slideWidth*scale;
    $("#editor").css('width', editor_width+'px');
    $(code_editor.win.document.body).bind("keydown", function(e) {
      if(e.keyCode == 27) {
        exit_coding_mode();
      }
    });
  }, 250);
  $("#save_slideshow").live("click", function(event) {
    save_slides();
    save_order();
    send_to_server();
  });
  $("#delete_current").live("click", function() { delete_current_slide(); })
  $("#duplicate_current").live("click", function() { duplicate_current_slide(); })

  $(".notes_container").live("dblclick", function(event) {
    if( $(".presentation").hasClass("editing_mode")) {
      var parent_id = $($(event.target).parent()).attr("id");
      if( parent_id == $(this).attr("id")) {
        new_note_from_click(event, parent_id.replace("raphael", "slide"));
      }
    }
  });

  $(".editable").live("dblclick", function(event) {
    var id = $(this).attr("id");
    if( $("#"+id+" .edit_area:hidden").size()) {
      $(".preview").show();
      $(".edit_area").hide();
      $(this).find(".preview").hide();
      $(this).find(".edit_area").show().focus();
    }
  });
  $(".editable").live("focusout", function() { 
      var id = $(this).attr("id");
      if( $("#"+id+" .edit_area:visible").size()) {
        exit_note_and_save(id);
      }
  });

  $(".editable").live("mouseenter", function() { grey_border(this); });
  $(".editable").live("mouseleave", function() { clear_borders();   });

  $(".editable").livequery( function() {
    $(this).draggable({ 
      snap: ".note",
      snapMode: "outer",
      containment: $(this).parent(".notes_container"),
      refreshPositions: true,
      drag: function(event, ui) {
        show_borders_this_red(this);
        $(this).css("opacity", 0.6);
      },
      stop: function(event, ui) {
        $(this).css("opacity", 1.0);
        clear_borders();
        grey_border(this);
        var id = extract_note_id(this);
        var parent_id = $("#"+id).parent().attr("id").replace("raphael", "slide");
        slides_hash[parent_id].notes[id].top = ui.position.top;
        slides_hash[parent_id].notes[id].left = ui.position.left;
        save_slides();
      }
    });
  });

 $(".editable").livequery( function() {
    $(this).resizable({
      handles: 'ne, nw, se, sw, n, e, s, w',
      containment: $(this).parent(),
      resize: function(event, ui) {
        $(this).css("opacity", 0.6);
        show_borders_this_red(this);
        uiWidth = ui.size.width;
        uiLeft = ui.position.left;
        uiHeight = ui.size.height;
        uiTop = ui.position.top;
        
        if( ui.position.left < 0) { 
          uiWidth = ui.size.width+ui.position.left;
          uiLeft = 0;
        } 
        if( (ui.position.left + ui.size.width) > slideWidth ) { 
          uiWidth = slideWidth - ui.position.left;
        }
        if( ui.position.top < 0) {
          uiHeight = ui.size.height+ui.position.top;
          uiTop = 0;
        } 
        if( ui.position.top + ui.size.height > slideHeight ) {
          uiHeight = slideHeight - ui.position.top;
        }
        $(this).find('.preview').css("width",(uiWidth)+"px");
        $(this).find('.edit_area').css("width",(uiWidth)+"px");
        $(this).find('.preview').css("height",(uiHeight)+"px");
        $(this).find('.edit_area').css("height",(uiHeight)+"px");
      },
      stop: function(event, ui) {
        $(this).css("opacity", 1.0);
        clear_borders();
        grey_border(this);
        var id = extract_note_id(this);
        var parent_id = $("#"+id).parent().attr("id").replace("raphael", "slide");
        slides_hash[parent_id].notes[id].top = uiTop;
        slides_hash[parent_id].notes[id].left = uiLeft;
        slides_hash[parent_id].notes[id].width = uiWidth;
        slides_hash[parent_id].notes[id].height = uiHeight;
        save_slides();
      }
    });
  });

  $(".future").live("click", function() { go_to_next(); });
  $(".past").live("click", function() { go_to_prev(); });

  $(document).keydown( function(e) {
    if( $(e.srcElement).hasClass("edit_area") && $(".edit_area").is(":visible")) { 
      if(e.keyCode == 27) {
        var id = $($(e.srcElement).parent()).attr("id");
        $("#"+id+" .edit_area").focusout();
      }
    } else {
      handleKeys(e); 
    }
  }, false);

  $("#sortable").livequery( function() {
    $(this).sortable({
      stop: function() {
        update_slide_order();
      }
    });    
  });
  $(".expose").live("dblclick", function(e) {
    var index = $(this).index(".expose");
    toggle_expose(index, e);
  });
});
function exit_note_and_save(note_id) {
  var dom_id = "#"+note_id;
  var parent_id = $(dom_id).parent().attr("id").replace("raphael", "slide");
  var edit_area_content = $(dom_id).find(".edit_area").val();
  $(dom_id).find(".preview").html(linen($(dom_id).find(".edit_area").val()));
  $(dom_id).find(".preview").show();
  $(dom_id).find(".edit_area").hide();
  if(edit_area_content == "") { 
    $(dom_id).remove();   
    delete slides_hash[parent_id].notes[note_id]; 
  } else {
    slides_hash[parent_id].notes[note_id].content = edit_area_content;
    save_slides();
    prettify();
  }
}
function update_slide_order() {
  for(var i=0; i< $(".slides .slide").size(); i++) {
    $($("#sortable .slide_number")[i]).html(i+1);
    order[i] = $($(".slide")[i]).attr("id");
  }
  save_order();
}

function handleKeys(e) {
 switch (e.keyCode) {
   case 37: // left arrow
     go_to_prev(); break;
   case 39: // right arrow
     go_to_next(); break;
   case 80: // P 
     presentationMode(); break;
   case 69: // E
     editingMode(); break;
   case 65: //a
     codingMode(); break;
   case 83: //s
     toggle_expose(0); break;
  }
}
function codingMode() {
  // It was simpler to just toggle but this seems safer
  if( $(".presentation").hasClass("grid_layout") ) {
  } else if( $(".presentation").hasClass("coding_mode") ) {
    exit_coding_mode();
  } else {
    begin_coding_mode();
  }
}
function exit_coding_mode() {
  $(".presentation").removeClass("coding_mode");
  $("#editor").hide('fast');
  $(".current").addClass("zoomed_in_slide").removeClass("small_float_right");
  $(".slide").addClass("slide_transition");
  $("#slide_options").show();
  $(".slide").css('-webkit-transform',"");
  $(".slide").css('margin-right', "");
}

function begin_coding_mode() {
  $(".presentation").addClass("coding_mode");
  $("#editor").show('slow');
  $(".current").removeClass("zoomed_in_slide").addClass("small_float_right");
  $(".slide").removeClass("slide_transition");
  $("#slide_options").hide();

  scale = $("#scale-slider").val() / 100;
  var margin_right = (-1)*(slideWidth*(1-scale)/2);
  $(".current").css('-webkit-transform','scale('+scale+')');
  $(".current").css('margin-right', margin_right+'px');
}
function presentationMode() {
    clear_borders();
    $("#options").hide();
    $(".presentation").removeClass("editing_mode");
    $(".note").removeClass("editable");
    $(".note").draggable("disable");
    $(".note").resizable("disable");
}
function editingMode() {
  if( !$(".presentation").hasClass("grid_layout") && !$(".presentation").hasClass("coding_mode") ) {
    $(".presentation").addClass("editing_mode");
    $("#options").show();
    $(".note").addClass("editable");
    $(".note").draggable("enable");
    $(".note").resizable("enable");
  }
}
function go_to_prev() {
  var index = $(".current").index(".slide")-1;
  if( index >= 0) { set_current(index); }
}

function go_to_next() {
  var index = $(".current").index(".slide")+1;
  if( index < $(".slide").size()) { 
    set_current(index);
  } 
  else if ( $(".presentation").hasClass("editing_mode") ) {
    create_new_slide_at_end();
  }
}
var Note = function() {
  this.id = (new Date()).getTime();
  this.slide_id;
  this.top; this.left; this.width = slideWidth/3; this.height = slideHeight/4;
  this.content = "p{color:red;}. Placeholder";
}
Note.prototype = {
  note_id: function() {return "note_"+this.id;}
}
var Slide = function() {
  this.notes = {};
  this.id = (new Date()).getTime();
  this.code = '// You can access raphael using \'paper\' by default\n'+ 
              '// paper.circle(100, 100, 100)\n'+
              '// You can access d3 using d3_paper\n';
}
Slide.prototype = {
  raphael_id: function() { return "raphael_"+this.id;},
  slide_id: function() { return "slide_"+this.id;}
}

function new_note_from_click(event, parent_id) {
  var n = new Note();
  n.slide_id = parent_id;
  n.top = event.offsetY;
  n.left = event.offsetX;
  $("#"+parent_id+" .notes_container").append(note_html(n));
  slides_hash[parent_id].notes[n.note_id()] = n;
  save_slides();
}
function make_notes(slide) {
  for( n_id in slide.notes) {
    $("#slide_"+slide.id+" .notes_container").append(note_html(slide.notes[n_id]));
  }
  clear_borders();
  prettify();
}

function make_slides() {
  if( slides_hash != null) {
    if( (order != null) && (order.length > 0) ) {
      for(var i = 0; i < order.length; i++) {
        var slide = slides_hash[order[i]]
        $(".slides").append(slide_html(slide));
        create_canvas(slide);
        make_notes(slide);
      }
    } else {
      for( s_id in slides_hash) {
        var slide = slides_hash[s_id];
        $(".slides").append(slide_html(slide));
        create_canvas(slide);
        make_notes(slide);
      }
    }
  }

  else {
    slides_hash = {};
    for(var i = 0; i < 3; i++) {
      var slide = new Slide();
      $(".slides").append( slide_html(slide) );
      create_canvas(slide);
      slides_hash[slide.slide_id()] = slide;
    }
  }
}
function local_name(type) {
  if(typeof slideshow_id != "undefined") {
    return type+slideshow_id;
  } else {
    return type;
  }
}
function read_slides() { slides_hash = JSON.parse(localStorage.getItem(local_name("slides"))); }
function save_slides() { localStorage.setItem(local_name("slides"), JSON.stringify(slides_hash)); increment_version(); send_to_server(); }
function save_order()  { localStorage.setItem(local_name("order"), JSON.stringify(order));        increment_version(); send_to_server(); }

function send_to_server() {
  var slideshow_hash = {};
  slideshow_hash.slides = slides_hash;
  slideshow_hash.order = order;
  var content = JSON.stringify(slideshow_hash);
  $.post("/update", {
    id: slideshow_id,
    version: local_version,
    cover: create_cover(),
    content: content }, function(txtstatus, result) {
      $("#options").after('<p id="status" style="display:none;">'+txtstatus+'</p>');
      $("#slides_container #status").fadeIn(1500).delay(500).fadeOut(1500).delay(500).queue(function() {
        $(this).remove();
        });
    });
}

function read_order()  { 
  order = JSON.parse(localStorage.getItem(local_name("order"))); 
  if(order == null) {
    order = [];
    var inc = 0;
    for(id in slides_hash) {
      order[inc] = id;
      inc++;
    }
  }
}
function read_version()  { 
  local_version = JSON.parse(localStorage.getItem(local_name("version")) ); 
  return local_version;
}
function increment_version()  { 
  var v = parseInt(localStorage.getItem(local_name("version")));
  var updated_version = v ? (v+=1):1
  localStorage.setItem(local_name("version"), updated_version ); 
}

function set_and_run_code(selector) {
  var id = extract_id(selector);
  code_editor.setCode(slides_hash[id].code);
  set_canvas(slides_hash[id])
}

function save_code(selector) {
  code_editor.save();
  var id = extract_id(selector);
  slides_hash[id].code = $("#editor textarea").val();
  save_slides();
}
function save_and_run_code() {
  save_code($(".current"))
  set_canvas(slides_hash[extract_id($(".current"))])
}
function extract_id(selector) {
  return $(selector).attr("id");
}

function extract_note_id(selector) {
  return $(selector).attr("id");
}
function create_cover() {
  var cover = {};

  cover.slide = slides_hash[order[0]];
  cover.height = slideHeight;
  cover.width = slideWidth;
  return JSON.stringify(cover);
}
function handleCorner() {
    scale = $("#scale-slider").val() / 100;
    var margin_right = (-1)*(slideWidth*(1-scale)/2);
    var editor_width = document.width - 10 - slideWidth*scale;
    $(".current").css('-webkit-transform','scale('+scale+')');
    $(".current").css('margin-right', margin_right+'px');
    $("#editor").css('width', editor_width+'px');
}
function toggle_expose(index) {
  if( $(".presentation").hasClass("grid_layout")) {
    $(".presentation").removeClass("grid_layout");
    $(".expose").unwrap();
    $(".slide").unwrap('<div class="expose" />');
    set_current(index);
    $(".slides").css("overflow", "hidden");
  } else {
    exit_coding_mode();
    presentationMode();
    $(".presentation").addClass("grid_layout");
    $(".slide").wrap('<div class="expose" />');
    $(".expose").wrapAll('<div id="sortable" />');
    $(".slide").removeClass("current reduced zoomed_in_slide slide_transition future far-future past far-past");
    $(".slide").addClass("gridify");
    $(".slides").css("overflow", "auto");
  }
}
