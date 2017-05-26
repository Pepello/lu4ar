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
}

function initCanvas(){
    $("#map").attr("width", "1000px");
    $("#map").attr("height", "1000px");
    canvas = new fabric.Canvas("map");
    canvas.setBackgroundColor("#eee");
    canvas.on('object:moving', snapToGrid);
    drawGrid("#fff");
}
