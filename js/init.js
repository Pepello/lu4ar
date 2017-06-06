/*jshint esversion: 6 */
var canvas, sr;
var robot;
var last_chain_s;

var typologies = {};
var hypotheses = [];
var entities = [];
var atoms_to_entities = {};

var port = 4200;
var grid = 25;
var block = grid*2;
var paths = {
    res: "res",
    icons: "res/icons"
};
var drag_drop = {
    type: ""
};

function sendCommand(f = undefined, opt = {}){
  $.ajax({
    type: "POST",
    url: "//127.0.0.1:"+port+"/service/nlu",
    data: {
        hypo: JSON.stringify({hypotheses: hypotheses}),
        entities: JSON.stringify({entities: entities})
    },
    success: function(resp){
        last_chain = resp;
        parseChain(resp);
        if(f !== undefined){
            f(opt);
        }
    }
  });

}

function onDragStart(){
    drag_drop.type = $(this).data("type");
}

function onDragEnd(){
    drag_drop.type = "";
}

function onDragEnter(event){
    // event.preventDefault();
    // event.stopPropagation();
    $(".canvas-container").addClass("dragging");
}

function onDragOver(event){
    event.preventDefault();
    event.stopPropagation();
}

function onDragLeave(event){
    // event.preventDefault();
    // event.stopPropagation();
    $(".canvas-container").removeClass("dragging");
}

function onDrop(event){
    // event.preventDefault();
    // event.stopPropagation();
    $(".canvas-container").removeClass("dragging");
    addEntity(drag_drop.type);
}

function fillTypologiesCollection(){
    $.each(typologies, function(i, typology){
        var item = $(
            '<li class="collection-item avatar" draggable="true" data-type="'+typology.type+'">'+
              '<img src="'+typology.getUrl()+'" alt="'+typology.type+'" class="circle" draggable="false">'+
              '<span class="title">'+typology.type+'</span>'+
            '</li>'
        );
        item.on("dragstart", onDragStart);
        item.on("dragend", onDragEnd);
        $("#objects .collection").append(item);
    });
}

function toFloating(){
    $("#mic").addClass("btn-floating waves-effect waves-circle waves-light");
    $("#mic div").text("");
    $("#mic i").addClass("active");
}

function toButton(){
    $("#mic").removeClass("btn-floating waves-effect waves-circle waves-light");
    $("#mic div").text("speak");
    $("#mic i").removeClass("active");
}

function alert(msg, time = 3000, style = "", callback = function(){}){
    Materialize.toast(msg, time, style, callback);
}

function error(msg, time = 3500){
    Materialize.toast(msg, time, "red darken-4");
}

$(function(){

    initSpeechRecognition();
    initObjects();
    initCanvas();
    fillTypologiesCollection();

    $(".canvas-container").on("dragenter", onDragEnter);
    $(".canvas-container").on("dragover", onDragOver);
    $(".canvas-container").on("dragleave", onDragLeave);
    $(".canvas-container").on("drop", onDrop);
    $("#mic").click(srStart);
    $("#form").submit(function(e){
        if(sr.isStarted){
            srAbort();
        }
        if($("#command").val()){
            setHypotheses([{transcript: $("#command").val(), confidence: "1"}]);
            sendCommand();
        }
        e.preventDefault();
    });
    $('ul.tabs').tabs();

    canvas.on('after:render', drawBoundingRects);


});
