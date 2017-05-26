/*jshint esversion: 6 */

entities = [
    // {
    //     "atom":"Kitchen",
    //     "type":"kitchen",
    //     "preferredLexicalReference":"kitchen",
    //     "alternativeLexicalReferences":[],
    //     "coordinate":{
    //         "x":"12.0",
    //         "y":"8.5",
    //         "z":"3.5",
    //         "angle":"3.5"
    //     }
    // }
];

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
                console.dir(_this);
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

    say(message, success = true, icon = "android"){
        var style;
        if(success) style = "lime"; else style = "red darken-2";
        alert("<i class='material-icons prev'>"+icon+"</i>"+message, 5000, style+" rounded");
    }

    greet(){
        this.say("Hi, I'm "+this.atom);
    }

    animate(props){
        this.drawable.animate(props, {onChange: canvas.renderAll.bind(canvas)});
    }

    move(props){
        this.animate(props);
    }
}

// function Coordinate(obj){
//     this.x = obj.x;
//     this.y = obj.y;
//     this.z = obj.z;
//     this.angle = obj.angle;
//     this.toJSON = function(){
//         return {
//             x: this.x.toString(),
//             y: this.y.toString(),
//             z: this.z.toString(),
//             angle: this.angle.toString()
//         };
//     };
// }

// function Typology(obj){
//     this.type = obj.type;
//     this.preferredLexicalReference = obj.preferredLexicalReference;
//     this.alternativeLexicalReferences = obj.alternativeLexicalReferences;
//     this.img = obj.img;
//     this.slot = obj.slot;
//     this.getUrl = function(){
//         return paths.icons+"/"+this.img.name+"."+this.img.type;
//     };
// }

// function Entity(obj){
//     this.atom = obj.atom;
//     this.typology = obj.typology;
//     this.drawable = {};
//     this.getCoordinate = function(){
//         return new Coordinate(this.drawable.left, this.drawable.top, 0, this.drawable.angle);
//     };
//     this.getWidth = function(){
//         return this.drawable.width;
//     };
//     this.getHeight = function(){
//         return this.drawable.height;
//     };
//     this.toJSON = function(){
//         return {
//             atom: this.atom,
//             type: this.typology.type,
//             preferredLexicalReference: this.typology.preferredLexicalReference,
//             alternativeLexicalReferences: this.typology.alternativeLexicalReferences,
//             coordinate: this.getCoordinate()
//         };
//     };
//     this.addToCanvas = (function(entity){
//         var url = entity.typology.getUrl();
//         if(entity.typology.img.type == "svg")
//             fabric.loadSVGFromURL(url, function(objs, opts){
//                 opts.lockRotation = opts.lockScalingX = opts.lockScalignY = opts.lockScalingFlip = true;
//                 entity.drawable = new fabric.PathGroup(objs, opts);
//                 entity.drawable.scaleToWidth(block*entity.typology.slot);
//                 canvas.add(entity.drawable);
//             });
//         else
//             fabric.Image.fromURL(url, function(obj){
//                 obj.lockRotation = obj.lockScalingX = obj.lockScalingY = obj.lockScalingFlip = true;
//                 entity.drawable = obj;
//                 canvas.add(obj);
//             },
//             {
//                 width: entity.typology.slot*block,
//                 height: entity.typology.slot*block
//             });
//     })(this);
// }

// function Robot(obj){
//     this.entity = obj.entity;
//     this.say = function(message, success = true, icon = "android"){
//         var style;
//         if(success) style = "lime"; else style = "red darken-2";
//         alert("<i class='material-icons prev'>"+icon+"</i>"+message, 5000, style+" rounded");
//     };
//     this.greet = function(){
//         this.say("Hi, I'm "+this.entity.atom);
//     };
//     this.move = function(props){
//         this.entity.drawable.animate(props, {onChange: canvas.renderAll.bind(canvas)});
//     };
// }

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
    var c = new Coordinate(1,2,3,4);
    console.log(JSON.stringify(c));
}
