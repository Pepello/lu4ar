/*jshint esversion: 6 */
var canvas, sr, ss;
var robot, speaker;
var last_chain_s;

var typologies = {};
var hypotheses = [];
var entities = [];
var atoms_to_entities = {};

var port = 4200;
var grid = 25;
var block = grid*2;
var lang = "en-GB";
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

function existsAtom(atom){
    return atoms_to_entities.hasOwnProperty(atom);
}

function getEntityIndexByAtom(atom){
    return atoms_to_entities[atom];
}

function getEntityByAtom(atom){
    return entities[atoms_to_entities[atom]];
}

function setEntityByAtom(atom, entity){
    atoms_to_entities[atom] = entity;
}

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

function addEntity(type, _atom = ""){
    var atom = _atom || type+"_"+entities.length;
    var obj = new Entity(atom, typologies[type]);
    entities.push(obj);
    setEntityByAtom(atom, entities.length - 1);
    return obj;
}

// function initSpeaker(){
//     typologies["me"] = new Typology("me", "me", [], {name: "avatar", type: "svg"}, 1);
//     speaker = addEntity("me");
//     speaker.fabric("center");
// }

function initAgent(){
    robot = new Agent("R2D2", "robot", "robot", ["android", "automa"], {name: "android", type: "png"}, 2.5);
}

function initTypologies(){
    typologies["book"] = new Typology("book", "book", ["volume", "manual"], {name: "book", type: "png"}, 1);
    typologies["table"] = new Typology("table", "table", ["desk"], {name: "table", type: "svg"}, 3);
    typologies["tv"] = new Typology("tv", "TV", ["tv", "televisor", "monitor", "screen"], {name: "tv", type: "svg"}, 2, ["off", "on"]);
    typologies["chair"] = new Typology("chair", "chair", [], {name: "chair-1", type: "svg"}, 2);
    typologies["elegant chair"] = new Typology("elegant chair", "chair", [], {name: "chair-2", type: "svg"}, 2);
}

function initMap(){
    addEntity("table").fabric("set",{top: 300, left: 500});
    addEntity("book").fabric("set",{top: 300, left: 500});
    addEntity("chair").fabric("set",{top: 600, left: 100});
    addEntity("tv").fabric("set",{top: 800, left: 800});
}

function initObjects(){
    // initSpeaker();
    initTypologies();
    initMap();
    initAgent();
}

$(function(){

    initSpeechRecognition();
    initSpeechSynthesis();
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
            // robot.resetChain();
        }
        e.preventDefault();
    });
    $('ul.tabs').tabs();

    // canvas.on('after:render', drawBoundingRects);


});
