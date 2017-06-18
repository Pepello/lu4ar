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
    constructor(_type, _plr, _alr, _img, _slot, _states = null){
        if(arguments.length > 1){
            this.type = _type;
            this.preferredLexicalReference = _plr;
            this.alternativeLexicalReferences = _alr;
            this.img = _img;
            this.slot = _slot;
            if(_states)
                this.states = _states;
        }
        else{
            this.type = _type.type;
            this.preferredLexicalReference = _type.preferredLexicalReference;
            this.alternativeLexicalReferences = _type.alternativeLexicalReferences;
            this.img = _type.img;
            this.slot = _type.slot;
            if(_type.states)
                this.states = _type.states;
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
    constructor(_mixed, _type, _plr, _alr, _img, _slot, _states = null){
        if(arguments.length > 1){
            super(_type, _plr, _alr, _img, _slot, _states);
            this.atom = _mixed;
        }
        else{
            super(_mixed.type);
            this.atom = _mixed.atom;
        }
        this.drawable = undefined;
        this.group_drawable = undefined;
        if(this.states)
            this.actual_state = 0;
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

    animate(props, _duration = 2500, _easing = "easeInOutCubic"){
        var _this = this;
        return new Promise(function(resolve, reject){
            _this.group_drawable.animate(props, {
                duration: _duration,
                onChange: canvas.renderAll.bind(canvas),
                onComplete: function(){
                    canvas.renderAll();
                    resolve(true);
                },
                easing: fabric.util.ease[_easing]
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
            _this.group_drawable.lockRotation = _this.group_drawable.lockScalingX = _this.group_drawable.lockScalingY = _this.group_drawable.lockScalingFlip = true;
            _this.group_drawable.hasControls = false;
            obj.group_drawable = cloned[1];
        });
    }

    ungroup(obj){
        var _this = this;
        return new Promise(function(resolve, reject){
            var group = _this.group_drawable.getObjects();
            _this.group_drawable.destroy();
            canvas.remove(_this.group_drawable).renderAll();
            _this.group_drawable = group[0];
            obj.group_drawable = group[1];
            _this.group_drawable.lockRotation = _this.group_drawable.lockScalingX = _this.group_drawable.lockScalingY = _this.group_drawable.lockScalingFlip = true;
            _this.group_drawable.hasControls = false;
            obj.group_drawable.lockRotation = obj.group_drawable.lockScalingX = obj.group_drawable.lockScalingY = obj.group_drawable.lockScalingFlip = true;
            obj.group_drawable.hasControls = false;
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
                    canvas.renderAll();
                    break;
                default:
                    drawable[name](params);
                    break;
            }
        });
    }

    changeState(state){
        var _this = this;
        return new Promise(function(resolve, reject){
            if(_this.hasOwnProperty('states')){
                if( _this.actual_state != _this.states.indexOf(state)){
                    _this.animate({opacity: 0.1}, 500, "easeOutExpo").then(function(){
                        return _this.animate({opacity: 1}, 500, "easeInExpo");
                    }).then(function(){
                        _this.actual_state = _this.states.indexOf(state);
                        resolve(_this.actual_state);
                    });
                }
                else
                    reject("same_state");
            }
            else{
                reject("no_state");
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
    constructor(_mixed, _type, _plr, _alr, _img, _slot){
        if(arguments.length > 1){
            super(_mixed, _type, _plr, _alr, _img, _slot);
        }
        else{
            super(_mixed);
        }
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


    checkProximity(entity, dist = 0){
        var _this = this;
        return new Promise(function(resolve, reject){
            resolve(_this.isNear(entity, dist));
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

    moveToEntity(entity, dist = 0, check = true){
        var _this = this;
        return this.checkProximity(entity, dist).then(function(isNear){
            if(!isNear)
                return _this.say("I'm going to the "+entity.type+" named: "+entity.atom).then(function(){
                    return _this.move(_this.getArrivalPoint(entity.getFrontalPoint(_this.getCenter()), entity.getCenter()));
                });
            else if(check)
                return _this.say("I'm near: "+entity.atom+", yet");
            else
                return Promise.resolve();
        });
    }

    take(obj, source){
        var _this = this;
        return new Promise(function(resolve, reject){
            if(_this.isNear(obj, _this.getWidth())){
                _this.say("I'm taking the "+obj.type).then(function(){
                    var dir = _this.getFrontalPoint(obj.getCenter()).sub(obj.getCenter());
                    return obj.animate(obj.getCoordinate().add(dir).toFabric(), 500, "easeOutElastic").then(function(){
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
                        return obj.animate(obj.getCoordinate().add(dir).toFabric(), 500, "easeOutExpo").then(resolve);
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
                        return obj.animate(obj.getCoordinate().add(dir).toFabric(), 500, "easeOutExpo").then(resolve);
                    });
                });
            }
            else
                return _this.say("I'm not holding the "+obj.type).then(reject);
        });
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
                return _this.moveToEntity(source, _this.getWidth(), false);
            });
        else
            this.chain(function(){
                return _this.moveToEntity(theme, _this.getWidth(), false);
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
                return _this.moveToEntity(goal, _this.getWidth(), false).then(function(){
                    return _this.leaveOn(theme, goal);
                });
            });
        }
        else
            this.chain(function(){
                return _this.leave(theme);
            });
    }

    PLACING(args){
        var _this = this;
        var theme, goal;
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
                return _this.say("I must know what to place");
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
                return _this.moveToEntity(goal, _this.getWidth(), false).then(function(){
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
        var _this = this;
        var source, theme, goal;
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
                return _this.say("I must know what to bring");
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
        else{
            this.chain(function(){
                return _this.say("I must know where to bring the"+theme.type);
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
                return _this.moveToEntity(source, _this.getWidth(), false);
            });
        else
            this.chain(function(){
                return _this.moveToEntity(theme, _this.getWidth(), false);
            });

        this.chain(function(){
            return _this.take(theme, source).then(function(){
                return _this.moveToEntity(goal, _this.getWidth(), false);
            }).then(function(){
                return _this.leaveOn(theme, goal);
            });
        });
    }

    GIVING(args){
        var _this = this;
        var theme, recipient;
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
                return _this.say("I must know what to give");
            });
            return;
        }
        if(args.hasOwnProperty("recipient")){
            if(args.recipient.hasOwnProperty("entity")){
                recipient = args.recipient.entity.value;
            }
            else{
                this.chain(function(){
                    return _this.say("I don't know what is "+args.recipient.value);
                });
                return;
            }
        }
        else{
            this.chain(function(){
                return _this.say("I must know who to give the"+theme.type);
            });
            return;
        }

        this.chain(function(){
            return _this.moveToEntity(theme, _this.getWidth(), false).then(function(){
                return _this.take(theme);
            }).then(function(){
                return _this.leaveOn(theme, recipient);
            });
        });

    }

    CHANGE_OPERATIONAL_STATE(args){
        var _this = this;
        var operational_state, device;
        if(args.hasOwnProperty("device")){
            if(args.device.hasOwnProperty("entity")){
                device = args.device.entity.value;
            }
            else{
                this.chain(function(){
                    return _this.say("I don't know what is "+args.device.value);
                });
                return;
            }
        }
        else{
            this.chain(function(){
                return _this.say("I must know which is the device");
            });
            return;
        }
        if(args.hasOwnProperty("operational_state")){
            operational_state = args.operational_state.value;
        }
        else{
            this.chain(function(){
                return _this.say("I must know the operational state");
            });
            return;
        }

        this.chain(function(){
            return _this.moveToEntity(device, _this.getWidth(), false).then(function(){
                return _this.say("I'm turning "+operational_state+" the "+device.type);
            }).then(function(){
                return device.changeState(operational_state);
            }).then(function(){
                return _this.say("Now the "+device.type+" is "+operational_state);
            }, function(error){
                if(error === "same_state")
                    return _this.say("The "+device.type+" is "+operational_state+", yet");
                else if(error === "no_state")
                    return _this.say("I cant't change the state of the "+device.type);
            });
        });
    }
}
