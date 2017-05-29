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
    getAnchorPoint(coord){
        var _coord = this.getCoordinate();
        var dir_x = _coord.x - coord.x > 0 ? 0 : 1;
        return new Coordinate(_coord.x + dir_x*this.getWidth(), _coord.y + this.getHeight()*.5, 0, 0);
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
        this.duration = 2500;
    }

    hasAction(action){
        return action in this;
    }

    getArrivalPoint(anchor){
        var _coord = this.getCoordinate();
        var dir_x = anchor.x - _coord.x > 0 ? -1 : 0;
        return new Coordinate(anchor.x + dir_x*this.getWidth(), anchor.y - this.getHeight()*.5, 0, 0);
    }

    say(message, success = true, icon = "android"){
        var style;
        if(success) style = "lime"; else style = "red darken-2";
        alert("<i class='material-icons prev'>"+icon+"</i>"+message, this.duration, style+" rounded");
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

    move(_coord){
        var coord = this.getArrivalPoint(_coord);
        this.animate(coord.toFabric());
    }

    execute(chain){
        var runningDuration = 0;
        for (var i = 0; i < chain.length; i++){
            window.setTimeout(chain[i], runningDuration);
            runningDuration += this.duration;
        }
    }

    MOTION(args){
        var queue = [];
        if(args.hasOwnProperty("goal") && args.goal.hasOwnProperty("entity"))
            queue.push(() => (this.move(getEntityByAtom(args.goal.entity.value).getAnchorPoint(this.getCoordinate()))));
        else if(args.hasOwnProperty("goal"))
            queue.push(() => (this.say("I don't know where is \""+args.goal.value+"\"...", false)));
        else{
            queue.push(() => (this.say("I don't know where to go...", false)));
        }
        return queue;
    }

    BRINGING(args){
        var queue = [];
        if(args.hasOwnProperty("source") && args.goal.hasOwnProperty("entity")){
            queue.push(() => (this.move(getEntityByAtom(args.source.entity.value).getCoordinate())));
            if(args.hasOwnProperty("theme") && args.theme.hasOwnProperty("entity")){
                queue.push(() => (this.move(getEntityByAtom(args.theme.entity.value).getCoordinate())));
                queue.push(() => (this.take(getEntityByAtom(args.theme.entity.value).getAnchorPoint())));
            }
            else if(args.hasOwnProperty("theme"))
                queue.push(() => (this.say("I don't know what is \""+args.theme.value+"\"...", false)));
            else
                queue.push(() => (this.say("I don't know what take...", false)));
        }
        else if(args.hasOwnProperty("theme") && args.theme.hasOwnProperty("entity"))
            queue.push(() => (this.move(getEntityByAtom(args.theme.entity.value).getCoordinate())));
        else if(args.hasOwnProperty("source"))
            queue.push(() => (this.say("I don't know where is \""+args.source.value+"\"...", false)));
        else{
            queue.push(() => (this.say("I don't know where to go...", false)));
        }
        return queue;
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

function initObjects(){
    initRobot();
    initTypologies();
}
