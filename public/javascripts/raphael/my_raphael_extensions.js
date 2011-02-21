Raphael.fn.arrow = function (x, y) {
  return this.path(["M", x, y] + "m-10-10l20,0 0-6 10,16 -10,16 0-6 -20,0 0,6 -10-16 10-16z").attr({fill: "#fff", stroke: "none", "stroke-dasharray": "-", "fill-opacity": 0.3});
};
Raphael.fn.randomCircle = function (cx, cy) {
  var r = (Math.random())*700*.3;
  var newCircle = this.circle(cx, cy, r).animate({fill: randomColor(), stroke: randomColor(), "stroke-width": Math.random()*80, "stroke-opacity": 0.5}, 2000).drag(moveCircle, startCircle, up);
  $(newCircle.node).dblclick( function() {
    newCircle.remove();
  });
  $(newCircle.node).mouseenter( function() {
    newCircle.animate({scale: "2.5 2.5"}, 2000);
  });
  $(newCircle.node).mouseout( function() {
    newCircle.animate({scale: "1.0 1.0"}, 2000);
  });
  $(newCircle.node).mousedown( function() {
    newCircle.toFront();
  });
  return newCircle;
};

Raphael.fn.randomRect = function(x, y) {
  var w = Math.random()*300;
  var h = Math.random()*200;
  var newRect = this.rect(x, y, w, h, w/10).animate({fill: randomColor(), stroke: randomColor(), "stroke-width": Math.random()*80, "stroke-opacity": 0.5}, 2000).drag(moveRect, startRect, up);
  $(newRect.node).dblclick( function() {
    newRect.remove();
  });         
  $(newRect.node).mouseenter( function() {
    newRect.animate({scale: "2.5 2.5"}, 2000);
  });
  $(newRect.node).mouseout( function() {
    newRect.animate({scale: "1.0 1.0"}, 2000);
  });
  $(newRect.node).mousedown( function() {
    newRect.toFront();
  });
  return newRect;
}

Raphael.fn.deleteButton = function(slide_id, hash) {
  var button = this.circle(20, 680, 10).attr("fill", "red");
  $(button.node).mouseenter( function() {
    button.animate({scale: "1.5 1.5"}, 2000, "bounce");
  });
  $(button.node).mouseout( function() {
    button.animate({scale: "1.0 1.0"}, 2000, "bounce");
  });
  $(button.node).click( function() {
    delete hash.slide_id;
    $(".current").hide();
  });
  return button;
}
