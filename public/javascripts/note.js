var res_start;
var code_editor;
var local_version, order = [];
var uiLeft, uiTop, uiWidth, uiHeight;
var slideWidth, slideHeight, cylonOffset;
var slides_hash = {}, notes_hash = {}, raphael_papers = {}, d3_papers = {};
$(function() {

  if( (typeof slideshow_hash != "undefined") && (slideshow_version > read_version()) ) {
    console.log("using db version");
    slides_hash = slideshow_hash.slides;
    notes_hash = slideshow_hash.notes;
    order = slideshow_hash.order;
    make_slides();
    make_notes();
    local_version = parseInt(slideshow_version)+1;
  } else {
    console.log("using local version");
    read_slides();
    read_notes();
    read_order();
    make_slides();
    make_notes();
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
  }, 250);
  $("#save_slideshow").live("click", function(event) {
    var slideshow_hash = {};
    save_notes();
    save_slides();
    save_order();
    slideshow_hash.slides = slides_hash;
    slideshow_hash.notes = notes_hash;
    slideshow_hash.order = order;
    var content = JSON.stringify(slideshow_hash);
    $.post("/update", {
      id: get_id(),
      version: local_version,
      title: "Testing",
      content: content }, function(result, txtstatus) {
      });
  });
  $("#delete_current").live("click", function() { delete_current_slide(); })
  $("#duplicate_current").live("click", function() { duplicate_current_slide(); })

  $(".notes_container").live("dblclick", function(event) {
    var parent_id = $($(event.target).parent()).attr("id");
    if( parent_id.split("_")[0] == "raphael") {
      new_note_from_click(event, parent_id.replace("raphael", "slide"));
    }
  });

  $(".editable").live("dblclick", function(event) {
    $(".preview").show();
    $(".edit_area").hide();
    $(this).find(".preview").hide();
    $(this).find(".edit_area").show().focus();
  });

  $(".editable").live("focusout", function(event) {
    var edit_area_content = $(this).find(".edit_area").val();
    var note_id = extract_note_id(this);
    $(this).find(".preview").html(linen($(this).find(".edit_area").val()));
    $(this).find(".preview").show();
    $(this).find(".edit_area").hide();
    notes_hash[note_id].content = edit_area_content;
    if(notes_hash[note_id].content == "") { 
      delete notes_hash[note_id]; 
      $(this).remove();   
    }
    save_notes();
    prettify();
  });
  $(".editable").live("mouseenter", function() { grey_border(this); });
  $(".editable").live("mouseleave", function() { clear_borders();   });

  $(".editable").livequery( function() {
    $(this).draggable({ 
      snap: ".note",
      snapMode: "outer",
      containment: $(this).parent(),
      refreshPositions: true,
      drag: function(event, ui) {
        show_borders_this_red(this);
        $(this).css("opacity", 0.6);
        var thisWidth = parseInt($(this).css("width"));
        var thisHeight = parseInt($(this).css("height"));
        uiLeft = ui.position.left;
        uiTop = ui.position.top;
        if( ui.position.left+thisWidth >= slideWidth) {
          uiLeft = slideWidth - thisWidth;
        }
        if( uiTop + thisHeight >= slideHeight ) {
          uiTop = slideHeight - thisHeight;
        }
        $(this).css("left", uiLeft+"px");
        $(this).css("top", uiTop+"px");
      },
      stop: function(event, ui) {
        $(this).css("left", uiLeft+"px");
        $(this).css("top", uiTop+"px");
        $(this).css("opacity", 1.0);
        clear_borders();
        grey_border(this);
        var id = extract_note_id(this);
        notes_hash[id].top = uiTop;
        notes_hash[id].left = uiLeft;
        save_notes();
      }
    });
  });

 $(".editable").livequery( function() {
    $(this).resizable({
      //grid: [460, 290], there is no snap tolerance it just makes the resizing space discrete
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
        notes_hash[id].top = uiTop;
        notes_hash[id].left = uiLeft;
        notes_hash[id].width = uiWidth;
        notes_hash[id].height = uiHeight;
        save_notes();
      }
    });
  });

  $(".future").live("click", function() { go_to_next(); });
  $(".past").live("click", function() { go_to_prev(); });

  $(document).keydown( function(e) {
    if( $(e.srcElement).hasClass("edit_area") || $(e.srcElement).hasClass("code")) { 
    } else {
      handleKeys(e); 
    }
  }, false);

  $("#boxes").sortable({
    stop: function(event, ui) {
      update_slide_order(ui.item);
    }
  });

  $(".box").live("click", function() {
    var index = $("#"+$(this).attr("id").replace("mini", "slide")).index(".slide"); // Because of the other items in the .slides div
    $(".slide").removeClass("current future past far-future far-past reduced");
    set_current(index);
  });
  $(".controlbar").live("mouseenter", function(event) {
      $(".controlbar").css("margin-left", "0px");
  });
  $(".controlbar").live("mouseleave", function(event) {
      $(".controlbar").css("margin-left", "-160px");
  });
});

function update_slide_order(item) {
  var new_order = $("#boxes").sortable('toArray');
  code_editor.setCode("");
  for(var i = 0; i < new_order.length; i++) {
    order[i] = new_order[i].replace("mini", "slide");
  }
  $(".slides .slide").remove();
  $("#boxes .box").remove();
  make_slides(); 
  make_notes();
  var index = $("#"+item.attr("id").replace("mini", "slide")).index(".slide");
  set_current(index);
  save_order();
  code_editor.setCode(slides_hash[extract_id($(".current"))].code);
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
     codingMode(e); break;
  }
}
function codingMode(e) {
  // It was simpler to just toggle but this seems safer
  if( $(".presentation").hasClass("coding_mode") ) {
    $(".presentation").removeClass("coding_mode");
    $("#editor").hide(e);
    $(".current").addClass("zoomed_in_slide").removeClass("small_float_right");
    $(".slide").addClass("slide_transition");
    $(".controlbar").show();
    $("#slide_options").show();
  } else {
    $(".presentation").addClass("coding_mode");
    $("#editor").show(e);
    $(".current").removeClass("zoomed_in_slide").addClass("small_float_right");
    $(".slide").removeClass("slide_transition");
    $(".controlbar").hide();
    $("#slide_options").hide();
  }
}
function presentationMode() {
    clear_borders();
    $("#save_slideshow").hide();
    $("#slide_options").hide();
    $(".presentation").removeClass("editing_mode");
    $(".note").removeClass("editable");
    $(".note").draggable("disable");
    $(".note").resizable("disable");
    $(".controlbar").hide();
}
function editingMode() {
    $(".presentation").addClass("editing_mode");
    $("#save_slideshow").show();
    $("#slide_options").show();
    $(".note").addClass("editable");
    $(".note").draggable("enable");
    $(".note").resizable("enable");
    $(".controlbar").show();
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
function create_canvas(slide) {
  d3_papers[slide.id] = d3.select("#d3_"+slide.id);
  var raphael_id = "raphael_"+slide.id;
  raphael_papers[slide.id] = Raphael(raphael_id, 900, 700);//, dashed = {fill: "none", stroke: "#666", "stroke-dasharray": "- "};;
 
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
  notes_hash[n.note_id()] = n;
  save_notes();
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
function box_html(slide) {
    //return '<div class="box app" id="mini_'+slide.id+'" style="-webkit-transform:scale(1);background:url(/images/slide_'+slide.id+'.png);">'+slide.id+'</div>'
    return '<div class="box app" id="mini_'+slide.id+'">'+$(".slide").size()+'</div>'
}

function make_notes() {
  if( notes_hash != null) {
    for( n in notes_hash) {
        make_a_note(notes_hash[n]);
    }
  }
  else { notes_hash = {}; }
  clear_borders();
}

function make_slides() {
  if( slides_hash != null) {
    if( (order != null) && (order.length > 0) ) {
      for(var i = 0; i < order.length; i++) {
        var slide = slides_hash[order[i]]
        $(".slides").append(slide_html(slide));
        $("#boxes").append(box_html(slide));
        create_canvas(slide);
      }
    } else {
      for( s_id in slides_hash) {
        var slide = slides_hash[s_id];
        $(".slides").append(slide_html(slide));
        $("#boxes").append(box_html(slide));
        create_canvas(slide);
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
function read_notes()  { notes_hash = JSON.parse(localStorage.getItem(local_name("notes"))); }
function save_slides() { localStorage.setItem(local_name("slides"), JSON.stringify(slides_hash)); increment_version(); }
function save_notes()  { localStorage.setItem(local_name("notes"), JSON.stringify(notes_hash));   increment_version(); }
function save_order()  { localStorage.setItem(local_name("order"), JSON.stringify(order));        increment_version(); }


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
  save_notes();
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

function get_id() {
  if(typeof slideshow_id != "undefined") {
    return slideshow_id;
  } else {
    return null;
  }
}

function delete_inactive_notes() {
  for(n in notes_hash) { 
    if( (order).indexOf(notes_hash[n].slide_id) == -1) { 
      delete notes_hash[n];
    }
  }
}
