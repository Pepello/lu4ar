/*jshint esversion: 6 */

class Coordinate{
    constructor(_x, _y, _z, _angle){
        this.x = _x;
        this.y = _y;
        this.z = _z;
        this.angle = _angle;
    }

    add(_coord){
        return new Coordinate(this.x + _coord.x, this.y + _coord.y, this.z + _coord.z, 0);
    }

    sub(_coord){
        return new Coordinate(this.x - _coord.x, this.y - _coord.y, this.z - _coord.z, 0);
    }

    mul(s){
        return new Coordinate(this.x*s, this.y*s, this.z*s, this.angle);
    }

    scalar(_coord){
        return this.x*_coord.x + this.y*_coord.y + this.z*_coord.z;
    }

    norm(){
        return Math.sqrt(this.scalar(this));
    }

    length(_coord){
        var v = _coord.sub(this);
        return v.norm();
    }

    toJSON(){
        return {
            x: this.x.toString(),
            y: this.y.toString(),
            z: this.z.toString(),
            angle: this.angle.toString()
        };
    }

    toFabric(){
        return {
            top: this.y,
            left: this.x,
            angle: this.angle
        };
    }
}

class Typology{
    constructor(_type, _plr, _alr, _img, _slot){
        if(arguments.length > 1){
            this.type = _type;
            this.preferredLexicalReference = _plr;
            this.alternativeLexicalReferences = _alr;
            this.img = _img;
            this.slot = _slot;
        }
        else{
            this.type = _type.type;
            this.preferredLexicalReference = _type.preferredLexicalReference;
            this.alternativeLexicalReferences = _type.alternativeLexicalReferences;
            this.img = _type.img;
            this.slot = _type.slot;
        }
    }

    getUrl(){
        return paths.icons+"/"+this.img.name+"."+this.img.type;
    }

    toJSON(){
        return {
            type: this.type,
            preferredLexicalReference: this.preferredLexicalReference,
            alternativeLexicalReferences: this.alternativeLexicalReferences
        };
    }
}

class Entity extends Typology{
    constructor(_atom, _type, _plr, _alr, _img, _slot){
        if(arguments.length > 2){
            super(_type, _plr, _alr, _img, _slot);
        }
        else{
            super(_type);
        }
        this.atom = _atom;
        this.load();
    }

    getCoordinate(){
        return new Coordinate(this.drawable.left, this.drawable.top, 0, this.drawable.angle);
    }
    getWidth(){
        return this.drawable.width;
    }
    getHeight(){
        return this.drawable.height;
    }
    getCenter(){
        var coord = this.getCoordinate();
        return new Coordinate(coord.x + this.getWidth()*0.5, coord.y + this.getHeight()*0.5, 0, 0);
    }
    getFrontalPoint(_center){
        var coord = this.getCoordinate();
        var center = this.getCenter();
        var dir_x = center.sub(_center).x > 0 ? 0 : 1;
        return new Coordinate(coord.x + dir_x*this.getWidth(), center.y, 0, 0);
    }
    isNear(obj, dist){
        var _front = obj.getFrontalPoint(this.getCenter());
        var front = this.getFrontalPoint(obj.getCenter());
        return front.length(_front) <= dist;
    }

    fabric(name, params){
        this.loaded.then(function(drawable){
            switch (name) {
                case "set":
                    drawable[name](params);
                    drawable.setCoords();
                    break;
            }
        });
    }

    load(){
        var _this = this;
        this.loaded = new Promise(function(resolve, reject){
            if(_this.type == "svg")
            fabric.loadSVGFromURL(_this.getUrl(), function(objs, opts){
                opts.lockRotation = opts.lockScalingX = opts.lockScalignY = opts.lockScalingFlip = true;
                _this.drawable = new fabric.PathGroup(objs, opts);
                _this.drawable.scaleToWidth(block*_this.slot);
                canvas.add(_this.drawable);
                resolve(_this.drawable);
            });
            else
            fabric.Image.fromURL(_this.getUrl(), function(obj){
                obj.lockRotation = obj.lockScalingX = obj.lockScalingY = obj.lockScalingFlip = true;
                _this.drawable = obj;
                canvas.add(obj);
                resolve(_this.drawable);
            },
            {
                width: _this.slot*block,
                height: _this.slot*block
            });
        });
    }

    toJSON(){
        var sup = super.toJSON();
        sup.atom = this.atom;
        sup.coordinate = this.getCoordinate();
        return sup;
    }
}

class EntityGroup{
    constructor(_master_or_components, _n_max_components){
        if(_master_or_components instanceof Entity)
        this.entities = [_master];
    }
}

// class Agent{
//     constructor(_atom, _type, _plr, _alr, _img, _slot){
//         this.self = new Entity(_atom, _type, _plr, _alr, _img, _slot);
//         this.obj =
//         this.loadSpeechSynthesis();
//     }
// }

class Robot extends Entity{
    constructor(_atom, _type, _plr, _alr, _img, _slot){
        super(_atom, _type, _plr, _alr, _img, _slot);
        this.loadSpeechSynthesis();
    }

    loadSpeechSynthesis(){
        var _this = this;
        this.utterance = new SpeechSynthesisUtterance();
        this.utterance.lang = lang;
        this.utterance.rate = .85;
        ss.voicesLoaded.then(function(voice){
            _this.utterance.voice = voice;
            _this.greet();
        });
    }

    hasAction(action){
        return action in this;
    }

    getArrivalPoint(anchor, _center){
        var center = this.getCenter();
        var dir_x = _center.sub(center).x > 0 ? -1 : 0;
        return new Coordinate(anchor.x + dir_x*this.getWidth(), anchor.y - this.getHeight()*0.5, 0, 0);
    }

    sayText(message, success = true, icon = "android"){
        var style;
        if(success) style = "lime"; else style = "red darken-2";
        return new Promise(function(resolve, reject){
            alert("<i class='material-icons prev'>"+icon+"</i>"+message, 3000, style+" rounded", function(){
                resolve(true);
            });
        });
    }

    say(message){
        var _this = this;
        return new Promise(function(resolve, reject){
            _this.utterance.text = message;
            _this.utterance.onend = function(){
                resolve(true);
            };
            ss.speak(_this.utterance);
        });
    }

    greet(){
        this.say("Hi, I'm "+this.atom);
    }

    animate(props){
        this.drawable.animate(props, {
            duration: this.duration,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuart
        });
    }

    queuedAnimation(props, _duration = 2500){
        var _this = this;
        return new Promise(function(resolve, reject){
            _this.drawable.animate(props, {
                duration: _duration,
                onChange: canvas.renderAll.bind(canvas),
                onComplete: function(){
                    canvas.renderAll();
                    resolve(true);
                },
                easing: fabric.util.ease.easeInOutCubic
            });
        });
    }

    move(_coord){
        var time = (this.getCoordinate().length(_coord)*0.01)*1000/2;
        return this.queuedAnimation(_coord.toFabric(), time);
    }

    // take(obj){
    //     var _this = this;
    //     return new Promise(function(resolve, reject){
    //         if(_this.drawable.intersectsWithObject(obj.drawable))
    //             _this.say("I'm near "+obj.atom).then(function(response){
    //                 resolve();
    //             });
    //         else
    //             _this.say("I'm far from "+obj.atom).then(function(response){
    //                 reject(false);
    //             });
    //
    //     });
    // }
    take(obj, source){
        var _this = this;
        return new Promise(function(resolve, reject){
            var takeable = _this.isNear(obj, _this.getWidth());
            var error = "";
            if(takeable){
                _this.say("I'm near to the "+obj.type+" enough");
                resolve(true);
            }
            else{
                _this.say("I'm not near to the "+obj.type+" enough");
                reject();
            }
        });
    }

    executeAction(args, action_name){
        var chain = Promise.resolve();
        var _this = this;
        if(args.hasOwnProperty("source")){
            var source = args.source;
            if(source.hasOwnProperty("entity")){
                if(!_this.isNear(source.entity.value,0))
                    chain = chain.then(function(response){
                        return _this.say("I'm going to the "+source.entity.key);
                    }).then(function(response){
                        return _this.move(_this.getArrivalPoint(source.entity.value.getFrontalPoint(_this.getCenter()), source.entity.value.getCenter()));
                    });
                else
                    chain = chain.then(function(response){
                        return _this.say("I'm near the "+source.entity.key+" yet");
                    });
            }
            else{
                chain = chain.then(function(response){
                    return _this.say("I don't know where is \""+source.entity.key+"\"...");
                });
                return chain;
            }
        }
        if(args.hasOwnProperty("theme")){
            var theme = args.theme;
            if(theme.hasOwnProperty("entity")){
                chain = chain.then(function(response){
                    return _this[action_name](args);
                });
            }
            else{
                chain = chain.then(function(response){
                    return _this.say("I don't know where is \""+theme.entity.key+"\"...");
                });
                return chain;
            }
        }
        if(args.hasOwnProperty("goal")){
            var goal = args.goal;
            if(goal.hasOwnProperty("entity")){
                if(!_this.isNear(goal.entity.value, 0))
                    chain = chain.then(function(response){
                        return _this.say("I'm going to the "+goal.entity.key);
                    }).then(function(response){
                        return _this.move(_this.getArrivalPoint(goal.entity.value.getFrontalPoint(_this.getCenter()), goal.entity.value.getCenter()));
                    });
                else
                    chain = chain.then(function(response){
                        return _this.say("I'm near the "+goal.entity.key+" yet");
                    });
            }
            else{
                chain = chain.then(function(response){
                    return _this.say("I don't know where is \""+goal.value+"\"...");
                });
                return chain;
            }
        }
        return chain;
    }

    MOTION(args){
        if(args.hasOwnProperty("goal") && args.hasOwnProperty("source")){
            return this.take(args.theme.entity.value);
        }
        else if(!args.hasOwnProperty("source"))
            return this.say("Tell me where to find the "+args.theme.entity.key, false);
        else
            return this.say("Tell me where to bring the "+args.theme.entity.key, false);
    }

    TAKING(args){
        if(args.hasOwnProperty("source")){
            return this.take(args.theme.entity.value, args.source.entity.value);
        }
        else{
            return this.take(args.theme.entity.value);
        }
    }

    BRINGING(args){
        return this.MOTION(args);
    }
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
    var obj = new Entity(atom, typologies[type]);
    entities.push(obj);
    setEntityByAtom(atom, entities.length - 1);
    return obj;
}

function initRobot(){
    robot = new Robot("R2D2", "robot", "robot", ["android", "automa"], {name: "android", type: "png"}, 2);
}

function initTypologies(){
    typologies["book"] = new Typology("book", "book", ["volume", "manual"], {name: "book", type: "png"}, 1);
    typologies["table"] = new Typology("table", "table", ["desk"], {name: "table", type: "svg"}, 3);
    typologies["tv"] = new Typology("tv", "TV", ["tv", "televisor", "monitor", "screen"], {name: "tv", type: "svg"}, 2);
    typologies["chair"] = new Typology("chair", "chair", [], {name: "chair-1", type: "svg"}, 2);
    typologies["elegant chair"] = new Typology("elegant chair", "chair", [], {name: "chair-2", type: "svg"}, 2);
}

function initMap(){
    addEntity("table").fabric("set",{top: 300, left: 500});
    addEntity("book").fabric("set",{top: 300, left: 500});
    addEntity("chair").fabric("set",{top: 600, left: 100});
}

function initObjects(){
    initTypologies();
    initMap();
    initRobot();
}
