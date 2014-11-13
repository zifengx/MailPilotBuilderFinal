﻿/// <reference path="constants.ts" />
/// <reference path="objects/plane.ts" />

var stage: createjs.Stage;
var queue;

//Game Objects
var plane: objects.Plane;
var island: Island;
var ocean: Ocean;
var scoreboard: Scoreboard;

//var cloud: Cloud;
//Cloud Array
var clouds = [];


function preload(): void {
    queue = new createjs.LoadQueue();
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", init);
    queue.loadManifest([       
        { id: "plane", src: "images/plane.png" },
        { id: "island", src: "images/island.png" },
        { id: "cloud", src: "images/cloud.png" },
        { id: "ocean", src: "images/ocean.gif" },
        { id: "yay", src: "sounds/yay.ogg" },
        { id: "biu", src: "sounds/biu.wav" },
        { id: "bi", src: "sounds/bi.wav" }
    ]);
}

function init(): void {
    stage = new createjs.Stage(document.getElementById("canvas"));
    stage.enableMouseOver(20);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", gameLoop);
    gameStart();
}

//Game Loop
function gameLoop(event): void {
    ocean.update();
    island.update();
    plane.update();
   // cloud.update();
    for (var count = 0; count < constants.CLOUD_NUM; count++) {
        clouds[count].update();
    }

    collisionCheck();
    scoreboard.update();
    stage.update();
}



//island class
class Island {
    image: createjs.Bitmap;
    width: number;
    height: number;
    dy: number;
    constructor() {
        this.image = new createjs.Bitmap(queue.getResult("island"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        this.dy = 5;
        stage.addChild(this.image);
        this.reset();
    }

    reset() {
        this.image.y = -this.height;
        this.image.x = Math.floor(Math.random() * stage.canvas.width);
    }

    update() {
        this.image.y += this.dy;
        if (this.image.y >= (this.height + stage.canvas.height)) {
            this.reset();
        }
    }
}

//cloud class
class Cloud {
    image: createjs.Bitmap;
    width: number;
    height: number;
    dy: number;
    dx: number;
    constructor() {
        this.image = new createjs.Bitmap(queue.getResult("cloud"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;      
        stage.addChild(this.image);
        this.reset();
    }

    reset() {
        this.image.y = -this.height;
        this.image.x = Math.floor(Math.random() * stage.canvas.width);

        this.dy = Math.floor(Math.random() * 5 + 5);
        this.dx = Math.floor(Math.random() * 4 - 2);
    }

    update() {
        this.image.y += this.dy;
        this.image.x += this.dx;
        if (this.image.y >= (this.height + stage.canvas.height)) {
            this.reset();
        }
    }
}


//ocean class
class Ocean {
    image: createjs.Bitmap;
    width: number;
    height: number;
    dy: number;
    constructor() {
        this.image = new createjs.Bitmap(queue.getResult("ocean"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.dy = 5;

        stage.addChild(this.image);
        this.reset();
    }

    reset() {
        this.image.y = -960;
    }

    update() {
        this.image.y += this.dy;
        if (this.image.y >= 0) {
            this.reset();
        }
    }
}

//The distance Utility function
function distance(p1: createjs.Point, p2: createjs.Point):number {
    var firstPoint: createjs.Point;
    var secondPoint: createjs.Point;
    var theXs: number;
    var theYs: number;
    var result: number;

    firstPoint = new createjs.Point();
    secondPoint = new createjs.Point();

    firstPoint.x = p1.x;
    firstPoint.y = p1.y;

    secondPoint.x = p2.x;
    secondPoint.y = p2.y;

    theXs = secondPoint.x - firstPoint.x;
    theYs = secondPoint.y - firstPoint.y;

    theXs = theXs * theXs; //theXs *= theXs;
    theYs = theYs * theYs;

    result = Math.sqrt(theXs + theYs);
    return result;
}

//Check Collision between Plane and Island
function planeAndIsland() {
    var point1: createjs.Point = new createjs.Point();
    var point2: createjs.Point = new createjs.Point();
    

    point1.x = plane.image.x;
    point1.y = plane.image.y;
    point2.x = island.image.x;
    point2.y = island.image.y;
    if (distance(point1, point2) < ((plane.height * 0.5) + (island.height * 0.5))){
        createjs.Sound.play("yay");
        scoreboard.score += 100;
        island.reset();
}
}

 //Check Collision between Plane and Cloud
function planeAndCloud(theCloud:Cloud) {
    var point1: createjs.Point = new createjs.Point();
    var point2: createjs.Point = new createjs.Point();
    var cloud: Cloud = new Cloud();

    cloud = theCloud;

    point1.x = plane.image.x;
    point1.y = plane.image.y;
    point2.x = cloud.image.x;
    point2.y = cloud.image.y;
    if (distance(point1, point2) < ((plane.height * 0.5) + (cloud.height * 0.5))) {
        createjs.Sound.play("bi");
        scoreboard.lives -= 1;
        cloud.reset();
    }
}

//Collision Check utility function
function collisionCheck() {
    planeAndIsland();
    for (var count = 0; count < constants.CLOUD_NUM; count++) {
        planeAndCloud(clouds[count]);
    }
}

class Scoreboard {
    label: createjs.Text;
    labelString: string= "";
    lives: number = constants.PLAYER_LIVES;
    score: number = 0;
    width: number;
    height: number;
    constructor() {       
        this.label = new createjs.Text(this.labelString, constants.GAME_FONT, constants.FONT_COLOUR);
        this.update();
        this.width = this.label.getBounds().width;
        this.height = this.label.getBounds().height;

        stage.addChild(this.label);
    }

    update() {
        this.labelString = "Lives: " + this.lives.toString() + " Score: " + this.score.toString();
        this.label.text = this.labelString;
    }
}
//Main Game Function
function gameStart(): void {

    var point1: createjs.Point = new createjs.Point();
    var point2: createjs.Point = new createjs.Point();
    
    ocean = new Ocean();
    island = new Island();
    plane = new objects.Plane();
    // cloud = new Cloud();
    for (var count = 0; count < constants.CLOUD_NUM; count++) {
        clouds[count] = new Cloud();
    }

    scoreboard = new Scoreboard();
}