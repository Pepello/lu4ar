/*jshint esversion: 6 */

function drawGrid(color){
  for (var i = 0; i < (canvas.width / grid); i++) {
    canvas.add(new fabric.Line([ i * grid, 0, i * grid, canvas.height], { stroke: color, selectable: false }));
    canvas.add(new fabric.Line([ 0, i * grid, canvas.width, i * grid], { stroke: color, selectable: false }));
  }
}

function snapToGrid(options){
    options.target.set({
        left: Math.round(options.target.left / grid) * grid,
        top: Math.round(options.target.top / grid) * grid
    });
    // highlightIntersection(options);
}

function drawBoundingRects(){
    var objs = entities.concat(robot);
    if(objs.length){
        canvas.contextContainer.strokeStyle = 'red';
        $.each(objs, function(i, obj){
            var bound = obj.drawable.getBoundingRect();
            canvas.contextContainer.strokeRect(
                bound.left + 0.5,
                bound.top + 0.5,
                bound.width,
                bound.height
            );
        });
    }
}

function highlightIntersection(options){
    var objs = entities.concat(robot);
    if(objs.length){
        options.target.setCoords();
        $.each(objs, function(i, obj) {
          if (obj.drawable === options.target) return;
          obj.drawable.setOpacity(options.target.intersectsWithObject(obj.drawable) ? 0.1 : 1);
        });
    }
}

function initCanvas(){
    $("#map").attr("width", "1000px");
    $("#map").attr("height", "1000px");
    canvas = new fabric.Canvas("map");
    canvas.setBackgroundColor("#eee");
    canvas.on('object:moving', snapToGrid);
    drawGrid("#fff");
}
