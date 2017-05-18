/*jshint esversion: 6 */
var canvas, sr;
var port = "2468";


function encodeAction(obj){
  var hypo = 'hypo={"hypotheses":[';
  $.each(obj, function(i, r){
    hypo += '{"transcription":'+r.transcript+',"confidence":'+r.confidence+'},';
  });
  hypo = hypo.substring(0, hypo.length - 1);
  hypo += "]}";
  return hypo;
}

function sendAction(action, f = undefined, opt = {}){
  $.ajax({
    type: "POST",
    url: "//127.0.0.1:"+port+"/service/nlu",
    data: action,
    success: function(response){
      alert(response);
      if(f !== undefined){
        f(opt);
      }
    }
  });

}

function srStart(){
  if(!sr.isStarted){
    sr.start();
  }
  else{
    alert("SpeechRecognition already started");
  }
}

function srStop(){
  sr.isStarted = false;
  $("#mic").removeClass("pulse");
  toButton();
  sr.stop();
  console.log("stopped");
}

function srAbort(){
  sr.isStarted = false;
  $("#mic").removeClass("pulse");
  toButton();
  sr.abort();
}

function srOnStart(){
  sr.isStarted = true;
  toFloating();
  $("#mic").addClass("pulse");
  // delay(5000);
}

function srOnError(e){
  var msg;
  if(e.error == 'no-speech'){
    msg = "No speech recognized";
  }
  if(e.error == 'audio-capture'){
    msg = "audio capture";
  }
  if(e.error == 'not-allowed'){
    msg = "Audio input not allowed";
  }
  error(msg);
  srStop();
}

function srOnResult(e){
  var results = e.results;
  var length = results.length;
  var str = "";
  // console.log(results);
  $("#others").empty();
  var collection = $('<div class="collection"></div>');
  $.each(results, function(j, res){
    str += res[0].transcript;
    for(var i = 1; i < res.length; i++) {
      var alt = $('<a href="#!" class="collection-item">'+res[i].transcript+'</a>');
      alt.click(function(){
        $("#command").val($(this).text());
      });
      collection.append(alt);
    }
    $("#panel ul.tabs").tabs("select_tab", "others");
  });
  $("#others").append(collection);
  $("#command").val(str);
  Materialize.updateTextFields();

  if(results[length-1].isFinal){
    sendAction(encodeAction(results[length-1]));
    srStop();
  }
}

function drawGrid(size, color){
  for (var i = 0; i < (canvas.width / size); i++) {
    canvas.add(new fabric.Line([ i * size, 0, i * size, canvas.height], { stroke: color, selectable: false }));
    canvas.add(new fabric.Line([ 0, i * size, canvas.width, i * size], { stroke: color, selectable: false }));
  }
}

function delay(time){
  setTimeout(function(){
    srStop();
  }, time);
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
  sr.onaudiostart = function(e){
    alert("Speak now!");
  };
  sr.onaudioend = function(e){
    console.log("audio end");
  };
  sr.onspeechstart = function(){
    console.log("speech start");
  };
  sr.onspeechend = function(){
    console.log("speech end");
  };
  sr.onsoundstart = function(){
    console.log("sound start");
  };
  sr.onsoundend = function(){
    console.log("sound end");
  };
  sr.onnomatch = function(e){
    console.log("no match");
  };
  sr.onerror = srOnError;
  sr.onend = srStop;
  sr.onresult = srOnResult;

  var c = $("#map");
  var grid = 50;

  c.attr("width", "1000px");
  c.attr("height", "1000px");
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

  $('ul.tabs').tabs();

  $("#form").submit(function(e){
    if(sr.isStarted){
      srAbort();
    }
    sendAction('hypo={"hypotheses":[{"transcription":'+$("#command").val()+',"confidence":"1","rank":"0"}]}');
    e.preventDefault();
  });

  $("#mic").click(srStart);

});
