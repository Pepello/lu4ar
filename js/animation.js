

function parseChain(chain){
    var actions = chain.split("#");
    console.dir(actions);
    $.each(actions, function(i, action){
        alert(action);
        parseAction(action);
    })
}

function parseAction(action){
    var verb = action.split("(", 1)[0];
    var params = action.substring(action.indexOf("(")+1, action.indexOf(")")).split(",");
    var params_list = [];
    $.each(params, function(i, param){
        params_list[i] = {
            key: param.split(":", 1)[0],
            value: param.split("\"")[1]
        }
    });
    console.dir(params_list);
    switch(verb){
        case "MOTION":
            MOTION(params_list);
            break;
        case "TAKING":
            break;
        default:
            alert("Action not recognised!", 3000, "red darken-4");
    }
}

function MOTION(params){
    if(params[0].key === "goal"){
        var target = getEntityFromName(params[0].value);
        if(target)
            move(target);
        else
            robot.say("Target not found", false, "error");
    }
}

function move(goal){
    var pos = goal.getCoordinate();
    robot.move({top: pos.y, left: pos.x});
}

function getEntityFromName(str){
    var r;
    $.each(entities, function(i, entity){
        if(searchEntity(str, entity))
            r = entity;
    });
    return r;
}

function searchEntity(where, what){
    var atom = where.indexOf(what.atom) >= 0;
    var type = where.indexOf(what.typology.type) >= 0;
    var pref = where.indexOf(what.typology.preferredLexicalReference) >= 0;
    // alert(atom+" "+type+" "+pref+" -> "+ (atom || type || pref), 7000);
    return (atom || type || pref);
}
