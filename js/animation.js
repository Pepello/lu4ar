/*jshint esversion: 6 */

function parseChain(chain_s){
    var actions_s = chain_s.split("#");
    $.each(actions_s, function(i, action_s){
        console.log(action_s);
        parseAction(action_s);
    });
}

function parseAction(action_s){
    var action_name = action_s.substring(0, action_s.indexOf("("));
    var args_s = action_s.substring(action_s.indexOf("(")+1, action_s.indexOf(")")).split(",");
    var args = {};
    $.each(args_s, function(i, arg_s){
        var param_s = arg_s.split("|", 1)[0];
        var entity_s = arg_s.split("|")[1];
        var arg = {
            value: param_s.split("\"")[1]
        };
        if(entity_s)
            arg.entity = {
                key: entity_s.split(":")[0],
                value: getEntityByAtom(entity_s.split("\"")[1].split("[")[0])
            };
        args[param_s.split(":")[0]] = arg;
    });
    console.log(action_name+": ", args);
    if(robot.hasAction(action_name))
        robot[action_name](args);
    else if(action_name !== "NO FRAME")
        robot.chain(function(){
            robot.say("I don't know what is "+action_name);
        });
    else
        robot.chain(function(){
            robot.say("I have not been programmed for this.... I don't understand");
        });
}
