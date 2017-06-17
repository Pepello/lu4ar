/*jshint esversion: 6 */
var canvas, sr, ss;
var robot, speaker;
var last_chain_s;

var maps = {};
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
    entity_type: "",
    map_id: "",
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
    console.log($(this).data("id"));
    if($(this).data("type") !== undefined)
        drag_drop.entity_type = $(this).data("type");
    if($(this).data("id") !== undefined)
        drag_drop.map_id = $(this).data("id").toString();
}

function onDragEnd(){
    drag_drop = {
        entity_type: "",
        map_id: "",
    };
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
    if(drag_drop.entity_type)
        addEntity(drag_drop.entity_type);
    if(drag_drop.map_id){
        fetchEntitiesByMapId(drag_drop.map_id).then(function(response){
            resetMap();
            console.dir(response);
            $.each(response, function(i, ey){
                addEntity(ey.type, ey.atom).fabric("set",ey.position);
            });
        });
    }
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

function fillMapsCollection(){
    $.each(maps, function(i, map){
        var item = $(
            '<li class="collection-item" draggable="true" data-id="'+map.id+'">'+
              '<span class="title">'+map.name+'</span>'+
            '</li>'
        );
        item.on("dragstart", onDragStart);
        item.on("dragend", onDragEnd);
        $("#maps .collection").append(item);
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
    var obj = new Entity({atom: atom, type: typologies[type]});
    entities.push(obj);
    setEntityByAtom(atom, entities.length - 1);
    return obj;
}

function resetMap(){
    resetCanvas();
    entities = [];
    atoms_to_entities = {};
}

// function initSpeaker(){
//     typologies["me"] = new Typology("me", "me", [], {name: "avatar", type: "svg"}, 1);
//     speaker = addEntity("me");
//     speaker.fabric("center");
// }

function initAgent(){
    robot = new Agent("R2D2", "robot", "robot", ["android", "automa"], {name: "android", type: "png"}, 2.5);
}

function initCanvas(){
    $("#map").attr("width", "1000px");
    $("#map").attr("height", "1000px");
    canvas = new fabric.Canvas("map");
    canvas.setBackgroundColor("#eee");
    canvas.on('object:moving', snapToGrid);
    drawGrid("#fff");
}

function initChain(){
    initSpeechRecognition();
    initSpeechSynthesis();
    initCanvas();
    Promise.all([fetchAllTypologies(), fetchAllMaps()]).then(function(){
        fillTypologiesCollection();
        fillMapsCollection();
        initAgent();
    }).then(function(){
        $(".loader").delay(500).fadeOut(1000, function(){
            $("body").removeClass("loading");
        });
    });
}

$(function(){


    initChain();
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

});
