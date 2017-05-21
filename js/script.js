/*jshint esversion: 6 */
var canvas, sr;
var robot;

var typologies = {};
var hypotheses = [];
var entities = [];

var port = "2468";
var grid = 25;
var block = grid*2;
var paths = {
    res: "res",
    icons: "res/icons"
}

var drag_drop = {
    type: ""
}

entities = [
    {
        "atom":"Canterbury tales",
        "type":"book",
        "preferredLexicalReference":"book",
        "alternativeLexicalReferences":["volume","manual"],
        "coordinate":{
            "x":"12.0",
            "y":"8.5",
            "z":"3.5",
            "angle":"3.5"
        }
    }
];

function setHypotheses(obj){
    hypotheses = [];
    $.each(obj, function(i, r){
        hypotheses[i] = {
            transcription: r.transcript,
            confidence: r.confidence,
            rank: i
        };
    });
}

function addEntity(type){
    var obj = new Entity({
            atom: type+" "+entities.length,
            typology: typologies[type],
            // coordinate: {x: 0, y: 0, z: 0, angle: 0}
        }
    );
    entities.push(obj);
}

function sendCommand(f = undefined, opt = {}){
  $.ajax({
    type: "POST",
    url: "//127.0.0.1:"+port+"/service/nlu",
    // data: objs,
    data: {
        hypo: JSON.stringify({hypotheses: hypotheses}),
        entities: JSON.stringify({entities: entities})
    },
    success: function(resp){
        alert(resp, 5000);
        parseChain(resp)
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
    event.preventDefault();
    event.stopPropagation();
    $(".canvas-container").addClass("dragging");
}

function onDragOver(event){
    event.preventDefault();
    event.stopPropagation();
}

function onDragLeave(event){
    event.preventDefault();
    event.stopPropagation();
    $(".canvas-container").removeClass("dragging");
}

function onDrop(event){
    event.preventDefault();
    event.stopPropagation();
    $(".canvas-container").removeClass("dragging");
    addEntity(drag_drop.type);
}

function fillTypologies(){
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

function alert(msg, time = 3000, style = ""){
    Materialize.toast(msg, time, style);
}

function error(msg, time = 3500){
    Materialize.toast(msg, time, "red darken-4");
}

$(function(){

    initSpeechRecognition();
    initGraphic();
    fillTypologies();

    $(".canvas-container").on("dragenter", onDragEnter);
    $(".canvas-container").on("dragover", onDragOver);
    $(".canvas-container").on("dragleave", onDragLeave);
    $(".canvas-container").on("drop", onDrop);
    $("#mic").click(srStart);
    $("#form").submit(function(e){
        if(sr.isStarted){
            srAbort();
        }
        setHypotheses([{transcript: $("#command").val(), confidence: "1"}]);
        sendCommand();
        e.preventDefault();
    });
    $('ul.tabs').tabs();


});
