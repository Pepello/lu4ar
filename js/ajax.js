
function fetchAllObjectTypologies(){
    return new Promise(function(resolve, reject){
        $.get("query.php?request=get_typologies&is_agent=0",function(response){
            var res = JSON.parse(response);
            $.each(res, function(i, ty){
                typologies.object[ty.type] = new Typology(ty.type, ty.plr, ty.alr, ty.img, ty.slot, ty.states);
            });
            resolve();
        }).fail(reject);
    });
}

function fetchAllAgentTypologies(){
    return new Promise(function(resolve, reject){
        $.get("query.php?request=get_typologies&is_agent=1",function(response){
            var res = JSON.parse(response);
            $.each(res, function(i, ty){
                typologies.agent[ty.type] = new Typology(ty.type, ty.plr, ty.alr, ty.img, ty.slot, ty.states);
            });
            resolve();
        }).fail(reject);
    });
}

function fetchAllMaps(){
    return new Promise(function(resolve, reject){
        $.get("query.php?request=get_maps",function(response){
            maps = JSON.parse(response);
            resolve();
        }).fail(reject);
    });
}

function fetchEntitiesByMapId(id){
    return new Promise(function(resolve, reject){
        $.get("query.php?request=get_entities&map_id="+id, function(response){
            resolve(JSON.parse(response));
        }).fail(reject);
    });
}

function fetchAgentByMapId(id){
    return new Promise(function(resolve, reject){
        $.get("query.php?request=get_agent&map_id="+id, function(response){
            resolve(JSON.parse(response));
        }).fail(reject);
    });
}
