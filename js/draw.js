

function drawGrid(size, color){
  for (var i = 0; i < (canvas.width / size); i++) {
    canvas.add(new fabric.Line([ i * size, 0, i * size, canvas.height], { stroke: color, selectable: false }));
    canvas.add(new fabric.Line([ 0, i * size, canvas.width, i * size], { stroke: color, selectable: false }));
  }
}

function initCanvas(){
    $("#map").attr("width", "1000px");
    $("#map").attr("height", "1000px");
    canvas = new fabric.Canvas("map");
    canvas.setBackgroundColor("#eee");
    canvas.on('object:moving', function(options) {
    options.target.set({
        left: Math.round(options.target.left / grid) * grid,
        top: Math.round(options.target.top / grid) * grid
        });
    });

    drawGrid(grid, "#fff");

  // canvas.add(new fabric.Rect({
  //   left: 100,
  //   top: 100,
  //   width: 50,
  //   height: 50,
  //   fill: '#faa',
  //   originX: 'left',
  //   originY: 'top',
  //   centeredRotation: true
  // }));
  //
  // canvas.add(new fabric.Circle({
  //   left: 300,
  //   top: 300,
  //   radius: 50,
  //   fill: '#9f9',
  //   originX: 'left',
  //   originY: 'top',
  //   centeredRotation: true
  // }));
}

function initRobot(){
    robot = new Robot({
        entity: new Entity({
            atom: "R2D2",
            typology: new Typology({
                type: "robot",
                preferredLexicalReference: "robot",
                alternativeLexicalReferences: ["automa", "android"],
                img : {
                    name: "android",
                    type: "svg"
                },
                slot: 2
            }),
            coordinate: {x: 0, y: 0, z: 0, angle: 0}
        })
    });
    robot.greet();
}

function initTypologies(){
    typologies.book = new Typology({
        type: "book",
        preferredLexicalReference: "book",
        alternativeLexicalReferences: ["volume", "manual"],
        img: {
            name: "book",
            type: "png"
        },
        slot: 1
    });
    typologies.table = new Typology({
        type: "table",
        preferredLexicalReference: "table",
        alternativeLexicalReferences: ["desk"],
        img: {
            name: "table",
            type: "png"
        },
        slot: 2
    });
    typologies.tv = new Typology({
        type: "tv",
        preferredLexicalReference: "tv",
        alternativeLexicalReferences: ["televisor", "monitor", "screen"],
        img: {
            name: "tv",
            type: "png"
        },
        slot: 1
    });
    typologies.chair = new Typology({
        type: "chair",
        preferredLexicalReference: "chair",
        alternativeLexicalReferences: [""],
        img: {
            name: "chair",
            type: "png"
        },
        slot: 1
    });
}

function initGraphic(){
    initCanvas();
    initRobot();
    initTypologies();
}


function Typology(obj){
    this.type = obj.type;
    this.preferredLexicalReference = obj.preferredLexicalReference;
    this.alternativeLexicalReferences = obj.alternativeLexicalReferences;
    this.img = obj.img;
    this.slot = obj.slot;
    this.getUrl = function(){
        return paths.icons+"/"+this.img.name+"."+this.img.type;
    }
}

function Entity(obj){
    this.atom = obj.atom;
    this.typology = obj.typology;
    // this.coordinate = obj.coordinate;
    this.drawable = {};
    this.getCoordinate = function(){
        return {
            x: this.drawable.left+this.drawable.width*.5+"",
            y: this.drawable.top+this.drawable.height*.5+"",
            z: "0",
            angle: this.drawable.angle+"",
        };
    }
    this.toJSON = function(){
        return {
            atom: this.atom,
            type: this.typology.type,
            preferredLexicalReference: this.typology.preferredLexicalReference,
            alternativeLexicalReferences: this.typology.alternativeLexicalReferences,
            coordinate: this.getCoordinate()
        }
    }
    this.load = (function(entity){
        var url = entity.typology.getUrl();
        if(entity.typology.img.type == "svg")
            fabric.loadSVGFromURL(url, function(objs, opts){
                // opts.top = entity.coordinate.y;
                // opts.left = entity.coordinate.x;
                opts.lockRotation = true;
                entity.drawable = new fabric.PathGroup(objs, opts);
                entity.drawable.scaleToWidth(block*entity.typology.slot);
                canvas.add(entity.drawable);
            });
        else
            fabric.Image.fromURL(url, function(obj){
                obj.lockRotation = true;
                entity.drawable = obj;
                canvas.add(obj);
            },
            {
                // top: entity.coordinate.x,
                // left: entity.coordinate.y,
                width: entity.typology.slot*block,
                height: entity.typology.slot*block
            })
    })(this);
}

function Robot(obj){
    this.entity = obj.entity;
    this.say = function(message, time, style){
        alert(message, time, style);
    }
    this.greet = function(){
        this.say("Hi, I'm "+this.entity.atom, 5000, "lime");
    }
    this.move = function(props){
        this.entity.drawable.animate(props, {onChange: canvas.renderAll.bind(canvas)});
    }
}
