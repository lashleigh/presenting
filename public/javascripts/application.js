// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

$(document).ready(function() {
  show_preview();
  $('#post_content').keyup(function() {
    show_preview();
  });
});

function show_preview() {
  $('#preview').html(linen($("#post_content").val()));
  $("pre").addClass("prettyprint");
  prettyPrint();
}  

