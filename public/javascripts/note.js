var code_editor;
var res;
var uiLeft, uiTop, uiWidth, uiHeight;
var slideWidth, slideHeight, cylonOffset;
var slides_hash = {}, notes_hash = {}, papers = {};
$(function() {
  read_slides();
  read_notes();
  make_slides();
  make_notes();
  setCurrent();
  slideWidth = $(".slide").width();
  slideHeight = $(".slide").height();

  var code_id = document.getElementById('code');
  code_editor = new CodeMirror.fromTextArea(code_id, {
    content: slides_hash[extract_id($(".current"))].code,
    parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
    stylesheet: "javascripts/codemirror/css/jscolors.css",
    path: "javascripts/codemirror/js/",
    autoMatchParens: true,
    width: "100%",
    height: "100%",
    saveFunction: function() {save_and_run_code();}
  });


  $(".raphael").dblclick( function(event) {
    if( $($(event.target).parent()).hasClass("raphael") ){
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
      opacity: 0.6,
      drag: function(event, ui) {
        show_borders_this_red(this);
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

});

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
    $(".presentation").toggleClass("coding_mode");
    $("#editor").toggle(e);
    $(".current").toggleClass("zoomed_in_slide").toggleClass("zoomed_out_slide");
    $(".slide").toggleClass("slide_transition");
}
function presentationMode() {
    clear_borders();
    $("#cue_box").hide();
    $(".presentation").removeClass("editing_mode");
    $(".note").removeClass("editable");
    $(".note").draggable("disable");
    $(".note").resizable("disable");
}
function editingMode() {
    $(".presentation").addClass("editing_mode");
    $("#cue_box").show();
    $(".note").addClass("editable");
    $(".note").draggable("enable");
    $(".note").resizable("enable");
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
    I.code = ""; /*='demo1 = paper.circle(320, 240, 60).animate({fill: "#223fa3", stroke: "#000", "stroke-width": 80, "stroke-opacity": 0.5}, 2000);\n'+
                    'demo1.node.onclick = function () {\n'+
                    '    demo1.attr("fill", "red");\n'+
                    '};\n\n'+
                    'var st = paper.set(); \n'+
                    'st.push( \n'+
                    '  paper.rect(800, 300, 50, 50, 10), \n'+
                    '  paper.circle(670, 100, 60) \n'+
                    ');\n\n'+
                    'st.animate({fill: "red", stroke: "#000", "stroke-width": 30, "stroke-opacity": 0.5}, 1000);';*/
    I.raphael_id = "raphael_"+I.id;
   
    return I;
}

function create_canvas(slide) {
  papers[slide.id] = d3.select("#"+slide.raphael_id).append("div").attr("class", "canvas"); //Raphael(slide.raphael_id, 900, 700), dashed = {fill: "none", stroke: "#666", "stroke-dasharray": "- "};;
 
  set_canvas(slide);
}
function set_canvas(slide) {
  //var paper = $("#"+slide.raphael_id).find(".canvas");
  var paper = papers[slide.id]
      $("#slide_"+slide.id+" .canvas").html("");
      //paper.clear();
      /*var button = paper.circle(20, 680, 10).attr("fill", "red");
      $(button.node).mouseenter( function() {
        button.animate({scale: "1.5 1.5"}, 2000, "bounce");
      });
      $(button.node).mouseout( function() {
        button.animate({scale: "1.0 1.0"}, 2000, "bounce");
      });
      $(button.node).dblclick( function() { go_to_next();*/
        //delete slides_hash[slide.raphael_id];
        //$(".current").hide();
        //go_to_next();
        //delete slides_hash[slide.raphael_id];
        //save_slides();
      //});
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
  
  I.top; I.left; I.width = 200; I.height = 100;

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
                 '</div>'
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
    for( s_id in slides_hash) {
      var slide = slides_hash[s_id];
      $(".slides").append(slide_html(slide));
      create_canvas(slide);
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
function read_slides() { slides_hash = JSON.parse(localStorage.getItem("slides")); }
function read_notes()  { notes_hash = JSON.parse(localStorage.getItem("notes")); }
function save_slides() { localStorage.setItem("slides", JSON.stringify(slides_hash)); }
function save_notes()  { localStorage.setItem("notes", JSON.stringify(notes_hash)); }

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
