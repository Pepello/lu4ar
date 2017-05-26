/*jshint esversion: 6 */

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

function fillHypothesesCollection(list){
    $("#others").empty();
    var collection = $('<div class="collection"></div>');
    $.each(list, function(i, transcript){
        var alt = $('<a href="#!" class="collection-item">'+transcript+'</a>');
        alt.click(function(){
            $("#command").val($(this).text());
        });
        collection.append(alt);
    });
    $("#others").append(collection);
}

function srOnResult(e){
    var results = e.results;
    var length = results.length;
    var str = "";
    var list = [];
    // console.log(results);
    $.each(results, function(j, res){
        str += res[0].transcript;
        for(var i = 0; i < res.length; i++){
            list.push(res[i].transcript);
        }
    });
    $("#command").val(str);
    fillHypothesesCollection(list);
    $("#panel ul.tabs").tabs("select_tab", "others");
    Materialize.updateTextFields();
    if(results[length-1].isFinal){
        setHypotheses(results[length-1]);
        sendCommand();
        srStop();
    }
}

function srOnAudioStart(e){
    alert("Speak now!");
}

function srOnAudioEnd(e){
    console.log("audio end");
}

function srOnSpeechStart(e){
    console.log("speech start");
}

function srOnSpeechEnd(e){
    console.log("speech end");
}

function srOnSoundStart(e){
    console.log("sound start");
}

function srOnSoundEnd(e){
    console.log("sound end");
}

function srOnNoMatch(e){
    console.log("no match");
}

function initSpeechRecognition(){
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
}
