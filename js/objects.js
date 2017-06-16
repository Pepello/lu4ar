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

    normalized(){
        return this.mul(1/this.norm());
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
        this.drawable = undefined;
        this.group_drawable = undefined;
        this.load();
    }

    getCoordinate(){
        return new Coordinate(this.group_drawable.left, this.group_drawable.top, 0, this.group_drawable.angle);
    }
    getWidth(){
        return this.group_drawable.width;
    }
    getHeight(){
        return this.group_drawable.height;
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
    contains(obj){
        return this.group_drawable.contains(obj.group_drawable);
    }

    animate(props, _duration = 2500){
        var _this = this;
        return new Promise(function(resolve, reject){
            _this.group_drawable.animate(props, {
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

    clone(main = false){
        var _this = this;
        return new Promise(function(resolve, reject){
            var obj = main ? _this.drawable : _this.group_drawable;
            obj.clone(function(clone){
                resolve(clone);
            });
        });
    }

    group(obj){
        var _this = this;
        return Promise.all([_this.clone(), obj.clone()]).then(function(cloned){
            var group = new fabric.Group(cloned);
            canvas.remove(obj.group_drawable).remove(_this.group_drawable).renderAll();
            canvas.add(group);
            _this.group_drawable = group;
            obj.group_drawable = cloned[1];
        });
    }

    ungroup(obj){
        var _this = this;
        // return new Promise(function(resolve, reject){
        //     var grouped = _this.group_drawable.destroy();
        //     grouped.item(0).clone(function(clone1){
        //         grouped.item(1).clone(function(clone2){
        //             canvas.add(clone1).add(clone2);
        //             _this.group_drawable = clone1;
        //             obj.group_drawable = clone2;
        //             resolve();
        //         });
        //     });
        // });
        // return obj.clone().then(function(cloned){
        //     _this.group_drawable.remove(obj.group_drawable);
        //     canvas.add(cloned);
        //     obj.group_drawable = cloned;
        // }) ;
        return new Promise(function(resolve, reject){
            var group = _this.group_drawable.getObjects();
            _this.group_drawable.destroy();
            canvas.remove(_this.group_drawable).renderAll();
            _this.group_drawable = group[0];
            obj.group_drawable = group[1];
            canvas.add(_this.group_drawable).add(obj.group_drawable);
            resolve();
        });
    }

    fabric(name, params, group = true){
        this.loaded.then(function(group_drawable){
            var drawable = group ? group_drawable : group_drawable.item(0);

            switch (name) {
                case "set":
                    drawable[name](params);
                    drawable.setCoords();
                    break;
                default:
                    drawable[name](params);
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
                var svg = new fabric.PathGroup(objs, opts);
                svg.hasControls = false;
                svg.scaleToWidth(block*_this.slot);
                _this.drawable = svg;
                _this.group_drawable = new fabric.Group([svg]);
                _this.group_drawable.hasControls = false;
                canvas.add(_this.group_drawable);
                resolve(_this.group_drawable);
            });
            else
            fabric.Image.fromURL(_this.getUrl(), function(obj){
                obj.lockRotation = obj.lockScalingX = obj.lockScalingY = obj.lockScalingFlip = true;
                obj.hasControls = false;
                _this.drawable = obj;
                _this.group_drawable = new fabric.Group([obj]);
                _this.group_drawable.hasControls = false;
                canvas.add(_this.group_drawable);
                resolve(_this.group_drawable);
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

class Agent extends Entity{
    constructor(_atom, _type, _plr, _alr, _img, _slot){
        super(_atom, _type, _plr, _alr, _img, _slot);
        this.loadSpeechSynthesis();
        this.actions_chain = Promise.resolve();
    }

    loadSpeechSynthesis(){
        var _this = this;
        this.utterance = new SpeechSynthesisUtterance();
        this.utterance.lang = lang;
        this.utterance.rate = 0.85;
        ss.voicesLoaded.then(function(voice){
            _this.utterance.voice = voice;
            _this.greet();
        });
    }

    chain(action){
        this.actions_chain = this.actions_chain.then(action);
    }

    resetChain(){
        this.actions_chain = Promise.resolve();
    }

    hasAction(action){
        return action in this;
    }

    getArrivalPoint(anchor, _center){
        var center = this.getCenter();
        var dir_x = _center.sub(center).x > 0 ? -1 : 0;
        return new Coordinate(anchor.x + dir_x*this.getWidth(), anchor.y - this.getHeight()*0.5, 0, 0);
    }


    checkProximity(entity){
        var _this = this;
        return new Promise(function(resolve, reject){
            resolve(_this.isNear(entity, 0));
        });
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
        return this.say("Hi, I'm "+this.atom);
    }

    move(_coord){
        var time = (this.getCoordinate().length(_coord)*0.01)*1000/2;
        return this.animate(_coord.toFabric(), time);
    }

    moveToEntity(entity){
        var _this = this;
        return this.checkProximity(entity).then(function(isNear){
            if(!isNear)
                return _this.say("I'm going to the "+entity.type+" named: "+entity.atom).then(function(){
                    return _this.move(_this.getArrivalPoint(entity.getFrontalPoint(_this.getCenter()), entity.getCenter()));
                });
            else
                return _this.say("I'm near: "+entity.atom+", yet");
        });
    }

    take(obj, source){
        var _this = this;
        return new Promise(function(resolve, reject){
            if(_this.isNear(obj, _this.getWidth())){
                _this.say("I'm taking the "+obj.type).then(function(){
                    var dir = _this.getFrontalPoint(obj.getCenter()).sub(obj.getCenter());
                    return obj.animate(obj.getCoordinate().add(dir).toFabric(), 500).then(function(){
                        return _this.group(obj);
                    });
                }).then(resolve);
            }
            else
                _this.say("I can't take the "+obj.type).then(reject);
        });
    }

    leave(obj){
        var _this = this;
        return new Promise(function(resolve, reject){
            if(_this.contains(obj)){
                _this.ungroup(obj).then(function(){
                    var dir = obj.getCenter().sub(_this.getCenter());
                    return _this.say("I'm leaving the "+obj.type).then(function(){
                        return obj.animate(obj.getCoordinate().add(dir).toFabric(), 500).then(resolve);
                    });
                });
            }
            else
                return _this.say("I'm not holding the "+obj.type).then(reject);
        });
    }

    leaveOn(obj, source){
        var _this = this;
        return new Promise(function(resolve, reject){
            if(_this.contains(obj)){
                _this.ungroup(obj).then(function(){
                    var dir = source.getCenter().sub(obj.getCenter());
                    return _this.say("I'm leaving the "+obj.type).then(function(){
                        return obj.animate(obj.getCoordinate().add(dir).toFabric(), 500).then(resolve);
                    });
                });
            }
            else
                return _this.say("I'm not holding the "+obj.type).then(reject);
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
        var _this = this;
        var source, theme, goal;
        if(args.hasOwnProperty("goal")){
            if(args.goal.hasOwnProperty("entity")){
                goal = args.goal.entity.value;
            }
            else{
                this.chain(function(){
                    return _this.say("I don't know where is "+args.goal.value);
                });
                return;
            }
        }
        else{
            this.chain(function(){
                return _this.say("I must know where to go");
            });
            return;
        }
        if(args.hasOwnProperty("source")){
            if(args.source.hasOwnProperty("entity")){
                source = args.source.entity.value;
            }
            else{
                this.chain(function(){
                    return _this.say("I don't know where is "+args.source.value);
                });
                return;
            }
        }

        if(source)
            this.chain(function(){
                return _this.moveToEntity(source);
            });

        this.chain(function(){
            return _this.moveToEntity(goal);
        });

    }

    TAKING(args){
        var _this = this;
        var source, theme;
        if(args.hasOwnProperty("theme")){
            if(args.theme.hasOwnProperty("entity")){
                theme = args.theme.entity.value;
            }
            else{
                this.chain(function(){
                    return _this.say("I don't know what is "+args.theme.value);
                });
                return;
            }
        }
        else{
            this.chain(function(){
                return _this.say("I must know what to take");
            });
            return;
        }
        if(args.hasOwnProperty("source")){
            if(args.source.hasOwnProperty("entity")){
                source = args.source.entity.value;
            }
            else{
                this.chain(function(){
                    return _this.say("I don't know where is "+args.source.value);
                });
                return;
            }
        }

        if(source)
            this.chain(function(){
                return _this.moveToEntity(source);
            });
        else
            this.chain(function(){
                return _this.moveToEntity(theme);
            });

        this.chain(function(){
            return _this.take(theme, source);
        });
    }

    RELEASING(args){
        var _this = this;
        var goal, theme;
        if(args.hasOwnProperty("theme")){
            if(args.theme.hasOwnProperty("entity")){
                theme = args.theme.entity.value;
            }
            else{
                this.chain(function(){
                    return _this.say("I don't know what is "+args.theme.value);
                });
                return;
            }
        }
        else{
            this.chain(function(){
                return _this.say("I must know what to leave");
            });
            return;
        }
        if(args.hasOwnProperty("goal")){
            if(args.goal.hasOwnProperty("entity")){
                goal = args.goal.entity.value;
            }
            else{
                this.chain(function(){
                    return _this.say("I don't know where is "+args.goal.value);
                });
                return;
            }
        }

        if(goal){
            this.chain(function(){
                return _this.moveToEntity(goal).then(function(){
                    return _this.leaveOn(theme, goal);
                });
            });
        }
        else
            this.chain(function(){
                return _this.leave(theme);
            });
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

function initAgent(){
    robot = new Agent("R2D2", "robot", "robot", ["android", "automa"], {name: "android", type: "png"}, 2);
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
    initAgent();
}
