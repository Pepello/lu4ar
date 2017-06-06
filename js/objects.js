/*jshint esversion: 6 */

class Coordinate{
    constructor(_x, _y, _z, _angle){
        this.x = _x;
        this.y = _y;
        this.z = _z;
        this.angle = _angle;
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
    getAnchorPoint(_center){
        var coord = this.getCoordinate();
        var center = this.getCenter();
        var dir_x = center.x - _center.x > 0 ? 0 : 1;
        return new Coordinate(coord.x + dir_x*this.getWidth(), center.y, 0, 0);
    }

    load(){
        var _this = this;
        if(this.type == "svg")
            fabric.loadSVGFromURL(this.getUrl(), function(objs, opts){
                opts.lockRotation = opts.lockScalingX = opts.lockScalignY = opts.lockScalingFlip = true;
                _this.drawable = new fabric.PathGroup(objs, opts);
                _this.drawable.scaleToWidth(block*_this.slot);
                canvas.add(_this.drawable);
            });
        else
            fabric.Image.fromURL(this.getUrl(), function(obj){
                obj.lockRotation = obj.lockScalingX = obj.lockScalingY = obj.lockScalingFlip = true;
                _this.drawable = obj;
                canvas.add(obj);
            },
            {
                width: _this.slot*block,
                height: _this.slot*block
            });
    }

    toJSON(){
        var sup = super.toJSON();
        sup.atom = this.atom;
        sup.coordinate = this.getCoordinate();
        return sup;
    }
}

class Robot extends Entity{
    constructor(_atom, _type, _plr, _alr, _img, _slot){
        super(_atom, _type, _plr, _alr, _img, _slot);
    }

    hasAction(action){
        return action in this;
    }

    getArrivalPoint(anchor, _center){
        var center = this.getCenter();
        var dir_x = _center.x - center.x > 0 ? -1 : 0;
        return new Coordinate(anchor.x + dir_x*this.getWidth(), anchor.y - this.getHeight()*0.5, 0, 0);
    }

    say(message, success = true, icon = "android"){
        var style;
        if(success) style = "lime"; else style = "red darken-2";
        return new Promise(function(resolve, reject){
            alert("<i class='material-icons prev'>"+icon+"</i>"+message, 3000, style+" rounded", function(){
                resolve(true);
            });
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
                easing: fabric.util.ease.easeInOutQuart
            });
        });
    }

    move(_coord){
        return this.queuedAnimation(_coord.toFabric(), 3000);
    }

    take(obj){
        var _this = this;
        return new Promise(function(resolve, reject){
            if(_this.drawable.intersectsWithObject(obj.drawable))
                _this.say("I'm near "+obj.atom).then(function(response){
                    resolve();
                });
            else
                _this.say("I'm far from "+obj.atom, false).then(function(response){
                    reject(false);
                });

        });
    }

    executeAction(args, action_name){
        var chain = Promise.resolve();
        var agent = this;
        if(args.hasOwnProperty("source")){
            var source = args.source;
            if(source.hasOwnProperty("entity")){
                chain = chain.then(function(response){
                    return agent.move(agent.getArrivalPoint(source.entity.value.getAnchorPoint(agent.getCenter()), source.entity.value.getCenter()));
                });
            }
            else{
                chain = chain.then(function(response){
                    return agent.say("I don't know where is \""+source.entity.key+"\"...", false);
                });
                return chain;
            }
        }
        if(args.hasOwnProperty("theme")){
            var theme = args.theme;
            if(theme.hasOwnProperty("entity")){
                chain = chain.then(function(response){
                    return agent[action_name](args);
                });
            }
        }
        if(args.hasOwnProperty("goal")){
            var goal = args.goal;
            if(goal.hasOwnProperty("entity")){
                chain = chain.then(function(response){
                    return agent.move(agent.getArrivalPoint(goal.entity.value.getAnchorPoint(agent.getCenter()), goal.entity.value.getCenter()));
                });
            }
            else{
                chain = chain.then(function(response){
                    return agent.say("I don't know where is \""+goal.entity.key+"\"...", false);
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
    robot.greet();
}

function initTypologies(){
    typologies["book"] = new Typology("book", "book", ["volume", "manual"], {name: "book", type: "png"}, 1);
    typologies["table"] = new Typology("table", "table", ["desk"], {name: "table", type: "svg"}, 3);
    typologies["tv"] = new Typology("tv", "TV", ["tv", "televisor", "monitor", "screen"], {name: "tv", type: "svg"}, 2);
    typologies["chair"] = new Typology("chair", "chair", [], {name: "chair-1", type: "svg"}, 2);
    typologies["elegant chair"] = new Typology("elegant chair", "chair", [], {name: "chair-2", type: "svg"}, 2);
}

function initMap(){
    var book = addEntity("book");
    book.drawable.set({
        top: 300,
        left: 500
    });
    var table = addEntity("table");
    table.drawable.set({
        top: 200,
        left: 500
    });
    var chair = addEntity("chair");
    chair.drawable.set({
        top: 500,
        left: 200
    });
}

function initObjects(){
    initTypologies();
    // initMap();
    initRobot();
}
