let room = new URLSearchParams(location.search).get("room");

let shared; 
// let bullets; // bullet array for bullet objects data 
let timer; // roundCount, count and roundFrame 

let participants; // role: "player1" | "player2" | "observer" + array of my
let my;

var ASSETS_MANAGER;

// global state
//let gameState = "PLAYING"; // TITLE, PLAYING

// general local parameters
var NORMAL_VEC; // this is how we control the direction of the bullet
var local_commands = []; // ESSENTIAL!!! -- local commands collection to control the clones
var await_commands = []; // actions waiting to be executed
var bullet_cooldown_id = {};

let local_commands_all = new Map(); //commands collection for the clones of all players 
let clones = []; 
let bullets = []; // LOCAL bullet array for bullet objects data 

// in-game parameters
const CLONE_MODE_ON = true;
const CHARACTER_SIZE = 40, BULLET_SIZE = 16, CHARACTER_ACL = 0.5, CHARACTER_VOL = 3, BULLET_VOL = 7, STAR_SIZE = 20;
const RELOAD_TIMER = 60, STUNNED_TIMER = 40

//timer related parameters
const ROUND_DURATION = 10; 
const ROUND_TOTAL = 10;
const FRAME_RATE = 60;


function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "bang_bang",
    room
  );
  
  // TO DO: merge timer within shared and change shared name to manager
  shared = partyLoadShared("shared");
  timer = partyLoadShared("timer");
  // bullets = partyLoadShared("bullets");
  
  participants = partyLoadParticipantShareds();
  my = partyLoadMyShared();
  
  // Every asset should be load inside the ASSETS_manager
  ASSETS_MANAGER = new Map();
  ASSETS_MANAGER.set("font", loadFont('assets/sancreek.ttf'));
  ASSETS_MANAGER.set("star", loadImage('assets/star.png'));
  ASSETS_MANAGER.set("mask", loadImage('assets/mask.png'));
  ASSETS_MANAGER.set("hat", loadImage('assets/hat.png'));
}

function setup() {
  createCanvas(600, 600);
  frameRate(FRAME_RATE);
  angleMode(DEGREES);
  colorMode(HSB, 255);
  rectMode(CENTER);
  textAlign(CENTER,CENTER);
  textFont(ASSETS_MANAGER.get("font"));
  noStroke();

  NORMAL_VEC = createVector(1, 0);
  
  //partyToggleInfo(false);
  
  if (partyIsHost()) { 
    stepHost();       
  } else if (participants.length >= 3) {
    partySetShared(my, {
    role: "observer",
    });
  } //TO DO : review observer mode

  // subscribe party functions
  partySubscribe("resetLocalPlayer", resetLocalPlayer);
  partySubscribe("restartLocalPlayer", restartLocalPlayer);

  partySubscribe("clearBullets", clearBullets);
  partySubscribe("downloadBullets", downloadBullets);
  partySubscribe("clearThisBullet", clearThisBullet);

  partySubscribe("stun", stun);

  partySubscribe("uploadCommands", uploadCommands);
  partySubscribe("downloadCommands", downloadCommands);
}

function draw() {
  
  background("rgb(202,44,44)");
  
  if (room == null) { 

    noStroke();
    textSize(20);
    fill(0);
    text("create/choose a room", width/2, height/3 - 50);
    text("using the input ", width/2, height/3 - 25);
    text("field above", width/2, height/3);
    
  } else {
    
    background("rgb(218,218,36)");

    if (my.role !== "player1" && my.role !== "player2") {
        joinGame();
        return;
    }

   // if(!shared.isRunning) {
    //if (gameState === "TITLE") {
    background("rgb(42,185,42)");
    // drawTitleScreen();
   // }

   // if(shared.gameState) {
    //if (gameState === "PLAYING") {
    background("rgb(0,0,0)");
    drawGame();
    //}
  }
}

function joinGame() {
  // don't let current players double join
  if (my.role === "player1" || my.role === "player2") {
    return;
  }

  if (!participants.find((p) => p.role === "player1")) {
    my.role = "player1";
    initializePlayer();
    return;
  }
  if (!participants.find((p) => p.role === "player2")) {
    my.role = "player2";
    initializePlayer();
    return;
  }
}

function stepHost(){
  shared.isRunning = false;
  shared.star = { // initialize the star
    pos_x: width / 2,
    pos_y: height / 2,
    vol_x: 0,
    vol_y: 0,
    dir: random(360),
    size: STAR_SIZE,
    isPicked: false
  }

  resetGameTimer();


  // bullets.bullets = [];
}

function initializePlayer(){
  my.enabled = false; // if the player is playing the game
  my.id = round(random(100)); // assign a unique ID to the player
  my.score = 0;
  my.isWin = false;
  my.alive = false; // if the player is alive

  // initialize the character
  my.origin = {
    pos_x: -200, // x postion
    pos_y: -200, // y postion
    vol_x: 0,
    vol_y: 0,
    dir: random(360), // face direction
    size: CHARACTER_SIZE,
    color: round(random(255)),
    reload: 0, // reloading cooldown timer
    stunned: 0, // stunned cooldown timer
    hasStar: false // if the character has the star
  };
  
  my.startPos = {x: 0, y: 0};

}