/*jshint esversion: 6 */

function parseChain(chain){
    var actions = chain.split("#");
    console.dir(actions);
    $.each(actions, function(i, action){
        alert(action);
        parseAction(action);
    });
}

function parseAction(action){
    var verb = action.split("(", 1)[0];
    var args = action.substring(action.indexOf("(")+1, action.indexOf(")")).split(",");
    var args_list = [];
    $.each(args, function(i, arg){
        var param = arg.split("|")[0];
        var entity = arg.split("|")[1];
        args_list[i] = {
            arg: {
                key: param.split(":", 1)[0],
                value: param.split("\"")[1]
            },
            entity: {
                    key: entity.split(":", 1)[0],
                    value: entity.split("\"")[1].split("[")[0]
                }
        };
    });
    console.dir(args_list);
    switch(verb){
        case "MOTION":
            MOTION(args_list);
            break;
        case "TAKING":
            break;
        default:
            alert("Action not recognised!", 3000, "red darken-4");
    }
}

function MOTION(params){
    if(params[0].arg.key === "goal"){
        if(existsAtom(params[0].entity.value))
            move(getEntityByAtom(params[0].entity.value));
        else
            robot.say(params[0].entity.value+" not found", false, "error");
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
