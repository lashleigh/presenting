var res_start, res_stop;
var code_editor;
var local_version, order = [];
var uiLeft, uiTop, uiWidth, uiHeight;
var slideWidth, slideHeight, cylonOffset;
var slides_hash = {}, notes_hash = {}, d3_papers = {}, raphael_papers = {};
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
  setCurrent();
  //presentationMode();
  editingMode();
  slideWidth = $(".slide").width();
  slideHeight = $(".slide").height();

  var code_id = document.getElementById('code');
  code_editor = new CodeMirror.fromTextArea(code_id, {
    content: slides_hash[extract_id($(".current"))].code,
    parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
    stylesheet: "/javascripts/codemirror/css/jscolors.css",
    path: "/javascripts/codemirror/js/",
    autoMatchParens: true,
    width: "100%",
    height: "100%",
    saveFunction: function() {save_and_run_code();}
  });

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
  $(".canvas").live("dblclick", function(event) {
    if( $($(event.target).parent()).hasClass("canvas") && $(".presentation").hasClass("editing_mode") ){
      var raphael_id = $($(event.target).parent()).parent().attr("id");
      new_note_from_click(event, raphael_id);
    }
  });

  $(".raphael").live("dblclick", function(event) {
    if( $($(event.target).parent()).hasClass("raphael") && $(".presentation").hasClass("editing_mode")){
      var raphael_id = $(event.target).parent().attr("id");
      new_note_from_click(event, raphael_id);
    }
  });

  $(".editable").live("dblclick", function(event) {
    $(".preview").show();
    $(".edit_area").hide();
    $(this).find(".preview").hide();
    $(this).find(".edit_area").show().focus();
    event.stopPropagation();
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
      $(this).hide();   
    }
    save_notes();
    prettify();
  });
  $(".editable").live("mouseenter", function() {
    grey_border(this);
    //prettify();
  });
  $(".editable").live("mouseleave", function() {
    clear_borders()
  });

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
     res_stop = ui;
     update_slide_order();
    }
  });
  //$(".controlbar").css("left", (document.width- 160)+"px");
  $(".controlbar").live("mouseenter", function(event) {
      $(".controlbar").css("margin-left", "0px");
  });
  $(".controlbar").live("mouseleave", function(event) {
      $(".controlbar").css("margin-left", "-160px");
  });
});
function update_slide_order() {
  var new_order = $("#boxes").sortable('toArray');
  code_editor.setCode("");
  for(var i = 0; i < new_order.length; i++) {
    order[i] = new_order[i].replace("mini", "raphael");
  }
  $(".slides").html('<button id="save_slideshow">Save</button>');
  $("#boxes").html("");
  make_slides(); 
  make_notes();
  setCurrent();
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
   //case 51: // 3
     //this.switch3D(); break;
   //case 83: //S
     //reorder_slides(); break;
  }
}
function codingMode(e) {
  // It was simpler to just toggle but this seems safer
  if( $(".presentation").hasClass("coding_mode") ) {
    $(".presentation").removeClass("coding_mode");
    $("#editor").hide(e);
    $(".current").addClass("zoomed_in_slide").removeClass("zoomed_out_slide");
    $(".slide").addClass("slide_transition");
  } else {
    $(".presentation").addClass("coding_mode");
    $("#editor").show(e);
    $(".current").removeClass("zoomed_in_slide").addClass("zoomed_out_slide");
    $(".slide").removeClass("slide_transition");
  }
}
function presentationMode() {
    clear_borders();
    $("#save_slideshow").hide();
    $(".presentation").removeClass("editing_mode");
    $(".note").removeClass("editable");
    $(".note").draggable("disable");
    $(".note").resizable("disable");
    $(".controlbar").hide();
}
function editingMode() {
    $(".presentation").addClass("editing_mode");
    $("#save_slideshow").show();
    $(".note").addClass("editable");
    $(".note").draggable("enable");
    $(".note").resizable("enable");
    $(".controlbar").show();
}
function go_to_prev() {
  var current = $(".current")
  save_code(current);
  if (current.prev().hasClass("slide")) {
    set_and_run_code($(current).prev());
    if( $(".presentation").hasClass("coding_mode") ) {
      current.addClass("zoomed_in_slide").removeClass("zoomed_out_slide");
      current.prev().addClass("zoomed_out_slide").removeClass("zoomed_in_slide");
    }

    current.prev().removeClass("reduced past").addClass("current")
    current.next().removeClass("future").addClass("far-future")
    current.addClass("reduced future").removeClass("current")
    current.prev().prev().addClass("past").removeClass("far-past")

  } else if( $(".presentation").hasClass("editing_mode")) {
  }
}

function go_to_next() {
  var current = $(".current")
  save_code(current);
  if( current.next().hasClass("slide"))  {
    set_and_run_code($(current).next());
    if ( $(".presentation").hasClass("coding_mode") ){
      current.addClass("zoomed_in_slide").removeClass("zoomed_out_slide");
      current.next().addClass("zoomed_out_slide").removeClass("zoomed_in_slide");
    }
    current.next().removeClass("future reduced").addClass("current")
    current.prev().removeClass("past").addClass("far-past")
    current.next().next().addClass("future reduced").removeClass("far-future")
    current.addClass("reduced past").removeClass("current") 

  } else if ( $(".presentation").hasClass("editing_mode") ) {
    // Create Slide and give it two notes
    current.prev().removeClass("past").addClass("far-past")
    current.addClass("reduced past").removeClass("current").addClass("zoomed_in_slide").removeClass("zoomed_out_slide") 

    var slide = Slide();
    var hash_id = slide.raphael_id;
    $(".slides").append( slide_html(slide) );
    slides_hash[hash_id] = slide;
    $("#slide_"+slide.id).addClass("current")
    save_slides();
    $("#editor textarea").val(slides_hash[hash_id].code);
    code_editor.setCode(slides_hash[hash_id].code);
    create_canvas(slide);
    set_and_run_code($(".current"));

    if( $(".presentation").hasClass("coding_mode")) {
      current.next().addClass("zoomed_out_slide").removeClass("zoomed_in_slide slide_transition");
    }

    // Autopopulate with two placeholder notes.    
    var header_note = Note();
    header_note.top = 0;
    header_note.left = 0;
    header_note.width = slideWidth;
    header_note.height = 110;
    header_note.content = "h1. Header holder";
    header_note.slide_id = slide.raphael_id;
    notes_hash[header_note.note_id] = header_note;
    make_a_note(header_note);

    var body_note = Note();
    body_note.top = 120;
    body_note.left = 0;
    body_note.width = slideWidth;
    body_note.height = 380;
    body_note.content = "p(pink). paragraphs here";
    body_note.slide_id = slide.raphael_id;
    notes_hash[body_note.note_id] = body_note;
    make_a_note(body_note);

    save_notes();
  };
  set_and_run_code($(".current"));
}

function setCurrent() {
  $($(".slide")[0]).addClass("current")
  $($(".slide")[1]).addClass("reduced future")
  for( var i = 2; i < $(".slide").length; i++) {
    $($(".slide")[i]).addClass("reduced far-future")
  }
  var id = extract_id( $(".current"));
  $("#editor textarea").val(slides_hash[id].code);
  set_canvas(slides_hash[id]);
}
function Slide(I) {
    I = I || {}

    I.id = (new Date()).getTime();
    I.code = ""; 
    I.raphael_id = "raphael_"+I.id;
   
    return I;
}

function create_canvas(slide) {
  d3_papers[slide.id] = d3.select("#"+slide.raphael_id).append("div").attr("class", "canvas");
  //raphael_papers[slide.id] = Raphael(slide.raphael_id, 900, 700), dashed = {fill: "none", stroke: "#666", "stroke-dasharray": "- "};;
 
  set_canvas(slide);
}
function set_canvas(slide) {
  //var paper = $("#"+slide.raphael_id).find(".canvas");
  var paper = d3_papers[slide.id];
  $("#slide_"+slide.id+" .canvas").html("");
  try {
    (new Function("paper", "window", "document", slide.code ) ).call(paper, paper);
  } catch (e) {
    alert(e.message || e);
  }
}

function Note(I) {
  I = I || {}

  I.active = true;

  I.id = (new Date()).getTime();
  I.note_id = "note_"+I.id;
  I.slide_id;
  
  I.top; I.left; I.width = slideWidth/3; I.height = slideHeight/4;

  I.content = "p{color:red;}. Placeholder";
  return I;
}
function new_note_from_click(event, raphael_id) {
  var n = Note();
  n.slide_id = raphael_id;
  n.top = event.offsetY;
  n.left = event.offsetX;
  $("#"+n.slide_id).append(note_html(n));
  notes_hash[n.note_id] = n;
  save_notes();
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
  $("#"+note.slide_id).append(note_html(note));
}
function note_html(note) {
    return '<div id="note_'+note.id+'" class="note editable" style="'+get_style(note)+'">'+
                              '<div class="preview">'+linen(note.content)+'</div>'+
                              '<textarea class="edit_area" style="width:'+note.width+'px;height:'+note.height+'px;"  >'+note.content+'</textarea>'+
                              '</div>'
}
function slide_html(slide) {
    return '<div id="slide_'+slide.id+'" class="slide zoomed_in_slide slide_transition">'+
              '<div id="'+slide.raphael_id+'" class="raphael"> </div>'+
              '<div class="slide_number">'+($(".slide").size()+1)+'</div>'+
           '</div>'
}
function box_html(slide) {
    //return '<div class="box app" id="mini_'+slide.id+'" style="-webkit-transform:scale(1);background:url(/images/slide_'+slide.id+'.png);">'+slide.id+'</div>'
    return '<div class="box app" id="mini_'+slide.id+'">'+$(".slide").size()+'</div>'
}
function handleCorner(event) {
    var border = $("#face-rounded-border").val();
    var scale = border / 100;
    var width = $(".current").width();
    var margin_right = (-1)*(width*(1-scale)/2);
    var exact_scale = parseFloat($($(".current").css("-webkit-transform").split(","))[0].split("(")[1]);
    var editor_width = screen.availWidth - 10 - $(".current").width()*exact_scale;
    $(".current").css('-webkit-transform','scale('+scale+')');
    $(".current").css('margin-right', margin_right+'px');
    $("#editor").css('width', editor_width+'px');
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
      var slide = Slide();
      $(".slides").append( slide_html(slide) );
      create_canvas(slide);
      slides_hash[slide.raphael_id] = slide;
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
  return $(selector).find(".raphael").attr("id");
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
