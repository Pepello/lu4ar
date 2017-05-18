/*jshint esversion: 6 */
var canvas, sr;
var hypotheses = [];
var entities = [];
var chain;
var port = "2468";
var grid = 25;


entities = [
    {
        "atom":"book 1",
        "type":"book",
        "preferredLexicalReference":"book",
        "alternativeLexicalReferences":["volume","manual"],
        "coordinate":{
            "x":"13.0",
            "y":"6.5",
            "z":"3.5",
            "angle":"3.5"
        }
    },
	{
        "atom":"table 1",
        "type":"table",
        "preferredLexicalReference":"table",
        "alternativeLexicalReferences":["bar","counter","desk","board"],
        "coordinate":{
            "x":"12.0",
            "y":"8.5",
            "z":"0.0",
            "angle":"1.6"
        }
    },
	{
        "atom":"chair 1",
        "type":"chair",
        "preferredLexicalReference":"chair",
        "alternativeLexicalReferences":[],
        "coordinate":{
            "x":"14.0",
            "y":"9.5",
            "z":"0.0",
            "angle":"1.6"
        }
    }
];

function setHypotheses(obj){
    hypotheses = [];
    $.each(obj, function(i, r){
        hypotheses[i] = {
            transcription: r.transcript,
            confidence: r.confidence+""
        };
    });
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
        chain = resp;
      alert(chain, 5000);
      if(f !== undefined){
        f(opt);
      }
    }
  });

}

function drawGrid(size, color){
  for (var i = 0; i < (canvas.width / size); i++) {
    canvas.add(new fabric.Line([ i * size, 0, i * size, canvas.height], { stroke: color, selectable: false }));
    canvas.add(new fabric.Line([ 0, i * size, canvas.width, i * size], { stroke: color, selectable: false }));
  }
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

function alert(msg, time = 3000){
  Materialize.toast(msg, time);
}

function error(msg, time = 3500){
  Materialize.toast(msg, time, "red darken-4");
}

$(function(){

    sr = new webkitSpeechRecognition();
    sr.isStarted = false;
    sr.interimResults = true;
    sr.maxAlternatives = 5;
    sr.onstart = srOnStart;
    sr.onaudiostart = srOnAudioStart;
    sr.onaudioend = srOnAudioEnd;
    sr.onspeechstart = srOnSpeechStart;
    sr.onspeechend = srOnSpeechEnd;
    sr.onsoundstart = srOnSoundStart;
    sr.onsoundend = srOnSoundEnd;
    sr.onnomatch = srOnNoMatch;
    sr.onerror = srOnError;
    sr.onend = srStop;
    sr.onresult = srOnResult;

    $("#map").attr("width", "1000px");
    $("#map").attr("height", "1000px");
    canvas = new fabric.Canvas("map");
    canvas.setBackgroundColor("#eee");
    canvas.on('object:moving', function(options) {
    options.target.set({
        left: Math.round(options.target.left / grid) * grid,
        top: Math.round(options.target.top / grid) * grid
        });
    });

    drawGrid(grid, "#fff");

  canvas.add(new fabric.Rect({
    left: 100,
    top: 100,
    width: 50,
    height: 50,
    fill: '#faa',
    originX: 'left',
    originY: 'top',
    centeredRotation: true
  }));

  canvas.add(new fabric.Circle({
    left: 300,
    top: 300,
    radius: 50,
    fill: '#9f9',
    originX: 'left',
    originY: 'top',
    centeredRotation: true
  }));

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
