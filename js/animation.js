

function parseChain(chain){
    var actions = chain.split("#");
    console.dir(actions);
    $.each(actions, function(i, action){
        checkAction(action);
    })
}

function checkAction(action){
    var verb = action.split("(", 1)[0];
    var params = action.substring(action.indexOf("(")+1, action.indexOf(")")).split(",");
    console.log(verb);
    console.dir(params);
    var params_list = [];
    $.each(params, function(i, param){
        params_list[i] = {
            key: param.split(":", 1)[0],
            value: param.split("\"")[1]
        }
    });
    console.dir(params_list);
    // switch(verb){
    //     case "MOTION":
    //
    //         var goal;
    //         alert("I'm going");
    //         break;
    //     case "TAKING":
    //         break;
    //     default:
    //         alert("Action not recognised!", 3000, "red darken-4");
    // }
}
