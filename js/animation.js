/*jshint esversion: 6 */

function parseChain(chain_s){
    var chain = [];
    var actions_s = chain_s.split("#");
    console.dir(actions_s);
    $.each(actions_s, function(i, action_s){
        console.log(action_s);
        chain = chain.concat(parseAction(action_s));
    });
    robot.execute(chain);
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
                value: entity_s.split("\"")[1].split("[")[0]
            };
        args[param_s.split(":")[0]] = arg;
    });
    console.dir(args);
    if(robot.hasAction(action_name))
        return robot[action_name](args);
    else
        return () => (robot.say("I don't know what is "+action_name+"...", false, "error"));
}


function getOverlappedArgs(args, agent){
    var sub_actions = []
    if(args.hasOwnProperty("source") && args.goal.hasOwnProperty("entity"))
        sub_actions.push(() => (agent.move(getEntityByAtom(args.source.entity.value).getCoordinate())));
    if(args.hasOwnProperty("theme") && args.goal.hasOwnProperty("entity"))
        sub_actions.push(() => (agent.move(getEntityByAtom(args.theme.entity.value).getCoordinate())));
    if(args.hasOwnProperty("goal") && args.goal.hasOwnProperty("entity"))
        sub_actions.push(() => (agent.move(getEntityByAtom(args.theme.entity.value).getCoordinate())));

}
