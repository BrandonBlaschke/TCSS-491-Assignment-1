
//Animation object that controls animations and can load new ones
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse, widthList, xList) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.widthList = widthList;
    this.xList = xList;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

//Draws the animation
Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;

    if (this.widthList != null) {
      ctx.drawImage(this.spriteSheet,
                    index * this.frameWidth + offset + this.xList[this.currentFrame()], vindex * this.frameHeight + this.startY,  // source from sheet
                    this.widthList[this.currentFrame()], this.frameHeight,
                    locX, locY,
                    this.frameWidth * scaleBy,
                    this.frameHeight * scaleBy);
    } else {
      ctx.drawImage(this.spriteSheet,
                    index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                    this.frameWidth, this.frameHeight,
                    locX, locY,
                    this.frameWidth * scaleBy,
                    this.frameHeight * scaleBy);
    }

}

//Helper functions for Animation
Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

//Checks if animation is done with a single animation
Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

//Background object
function Background(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

//Create new background Entity
Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {

}

//Draw the ground
Background.prototype.draw = function (ctx) {

    //Background values like color and position
    ctx.fillStyle = "SaddleBrown";

    //fillRect(x,y,width, height)
    ctx.fillRect(0,405,800,400);
    Entity.prototype.draw.call(this);
}


//MC object
function MasterCheif(game) {

  //These are used to offset the x and width positions because the sptire sheet
  //Isn't perfectly alligned
  let widthListRunning = [80, 80, 80, 80, 83, 80, 80, 80, 82];
  let xListRunning = [0, 0, 0, 0, 20, 25, 28, 36, 58];

  let grenadeW = [90, 90, 90, 90, 100];
  let grenadeX = [-10, -10, -10, -10, 3];
  this.runningAnimation = new Animation(ASSET_MANAGER.getAsset("./img/MCSprite.png"), 14, 265, 80, 110, .1, 9, true, false, widthListRunning, xListRunning);
  this.shootAnimation = new Animation(ASSET_MANAGER.getAsset("./img/MCSprite.png"), 22, 150, 85, 110, .1, 2, true, false);
  this.idleAnimation = new Animation(ASSET_MANAGER.getAsset("./img/MCSprite.png"),94, 525, 80, 110, .15, 1, true, false);
  this.grenadeAnimation = new Animation(ASSET_MANAGER.getAsset("./img/MCSprite.png"), 10, 4580, 80, 110, .1, 5, false, false, grenadeW, grenadeX);
  this.running = false;
  this.shoot = false;
  this.idle = true;
  this.grenade = false;
  this.game = game;
  this.x = 100;
  this.y = 300;
  this.speed = 160;
  Entity.call(this, game, this.x, this.y);
}

//Entity for MC
MasterCheif.prototype = new Entity();

//Constructor
MasterCheif.prototype.constructor = MasterCheif;

//Update MC
MasterCheif.prototype.update = function() {
  if (this.game.d) {
    this.idle = false;
    this.shoot = false;
    this.running = true;
  } else if (this.game.shoot) {
    this.running = false;
    this.shoot = true;
    this.idle = false;
  } else if (this.game.idle) {
    this.shoot = false;
    this.running = false;
    this.idle = true;
    this.grenade = false;
  } else if (this.game.g) {
    this.shoot = false;
    this.running = false;
    this.idle = false;
    this.grenade = true;
  }

  if (this.grenadeAnimation.isDone()) {
    this.grenadeAnimation.elapsedTime = 0;
    this.grenade = false;
    this.idleAnimation.elapsedTime = 0;
    this.idle = true;
  }

  if (this.running) {
    this.x += this.speed * this.game.clockTick;
  }

  if (this.x > 800) {
    this.x = -50;
  }
  Entity.prototype.update.call(this);
}

MasterCheif.prototype.draw = function(ctx) {

  if (this.running) {
    this.runningAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
  } else if (this.shoot) {
    this.shootAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
  } else if (this.grenade) {
    this.grenadeAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y - 8, 1.06);
  } else {
    this.idleAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
  }
}

//Create AssetManager and give it the file to read from
var ASSET_MANAGER = new AssetManager();
ASSET_MANAGER.queueDownload("./img/MCSprite.png");

//downloadAll to game and start engine
ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    //Create game
    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);

    //Add game Entities to world
    let mc = new MasterCheif(gameEngine);
    gameEngine.addEntity(mc);
    gameEngine.addEntity(bg);

    gameEngine.init(ctx);
    gameEngine.start();
});
