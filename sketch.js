let room = new URLSearchParams(location.search).get("room");

let shared; 
let bullets; // bullet array for bullet objects data
let timer; // roundCount, count and roundFrame 

let participants; // role: "player1" | "player2" | "observer" + array of my
let my;

var ASSETS_MANAGER;

// global state
let gameState = "TITLE"; // TITLE, MENU, PLAYING

// general local parameters
var NORMAL_VEC; // this is how we control the direction of the bullet
var local_commands = []; // ESSENTIAL!!! -- local commands collection to control the clones
var await_commands = []; // actions waiting to be executed
var bullet_cooldown_id = {};

// in-game parameters
const CLONE_MODE_ON = true;
const CHARACTER_SIZE = 40, BULLET_SIZE = 14, CHARACTER_ACL = 0.5, CHARACTER_VEL = 3, BULLET_VEL = 10, BADGE_SIZE = 20;
const RELOAD_TIMER = 60, STUNNED_TIMER = 40

// canvas parameters
const SCREEN_WIDTH = 900, SCREEN_HEIGHT = 700;
const SITE = {left: 0, right: SCREEN_WIDTH, top: 120, bottom: SCREEN_HEIGHT};

//timer related parameters
const ROUND_DURATION = 10; 
const ROUND_TOTAL = 5;
const FRAME_RATE = 60;
const INBETWEEN_DURATION = 3;


function preload() {
  partyConnect(
    "wss://deepstream-server-1.herokuapp.com",
    "bang_bang",
    room
  );
  
  // TO DO: merge timer within shared and change shared name to manager
  shared = partyLoadShared("shared");
  timer = partyLoadShared("timer");
  bullets = partyLoadShared("bullets");
  
  participants = partyLoadParticipantShareds();
  my = partyLoadMyShared();
  
  // Every asset should be loaded inside the ASSETS_manager
  ASSETS_MANAGER = new Map();
  ASSETS_MANAGER.set("font", loadFont('assets/sancreek.ttf'));
  
  ASSETS_MANAGER.set("player_left", loadImage('assets/player_left.png'));
  ASSETS_MANAGER.set("player_right", loadImage('assets/player_right.png'));
  ASSETS_MANAGER.set("minibadge", loadImage('assets/minibadge.png'));
  ASSETS_MANAGER.set("badge", loadImage('assets/badge.png'));
  ASSETS_MANAGER.set("background", loadImage('assets/background.png'));

  
  ASSETS_MANAGER.set("screen_room", loadImage('assets/screen_room.png'));
  ASSETS_MANAGER.set("screen_logo", loadImage('assets/screen_logo.png'));
  ASSETS_MANAGER.set("screen_menu", loadImage('assets/screen_menu.png'));
  ASSETS_MANAGER.set("screen_credits", loadImage('assets/screen_credits.png'));

  
  ASSETS_MANAGER.set("tutorial_1", loadImage('assets/tutorial_1.png'));
  ASSETS_MANAGER.set("tutorial_2", loadImage('assets/tutorial_2.png'));
  ASSETS_MANAGER.set("tutorial_3", loadImage('assets/tutorial_3.png'));
  ASSETS_MANAGER.set("tutorial_4", loadImage('assets/tutorial_4.png'));
  ASSETS_MANAGER.set("tutorial_5", loadImage('assets/tutorial_5.png'));
}

function loadAnim(path, num) { // load a series of png as an array
  let anim = [];
  for(i = 1; i <= num; i++) anim.push(loadImage(path + i + '.png'));
  return anim;
}

function setup() {
  createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
  frameRate(FRAME_RATE);
  angleMode(DEGREES);
  colorMode(HSB, 255);
  rectMode(CENTER);
  textAlign(CENTER,CENTER);
  textFont(ASSETS_MANAGER.get("font"));
  noStroke();

  NORMAL_VEC = createVector(1, 0);

  partyToggleInfo(false);
  
  if (partyIsHost()) { 
    stepHost();       
  } else if (participants.length >= 3) {
    partySetShared(my, {
    role: "observer",
    });
  } //TO DO : review observer mode

  // subscribe party functions
  partySubscribe("resetLocalClients", resetLocalPlayer);
  partySubscribe("restartLocalClients", restartLocalPlayer);
  partySubscribe("clearBullets", clearBullets);
  partySubscribe("stun", stun);
}

function draw() {
  background("#CF960B");
  imageMode(CORNER);
  rectMode(CENTER);

  if(gameState === "PLAYING") {
    if (my.role !== "player1" && my.role !== "player2") {
      joinGame();
      return;
    }
    drawGame();
  } else if (gameState === "TITLE" && room == null) {
    titleScreen();
  } else if (gameState === "MENU" && room == null) {
    roomScreen();
  } else if (gameState === "MENU" || room != null) {
    partyToggleInfo(true);
    menuScreen();
  }
}

function joinGame() {
  // don't let current players double join
  if (my.role === "player1" || my.role === "player2") {
    return;
  }

  // if there is no player, attribute role
  if (!participants.find((p) => p.role === "player1")) {
    my.role = "player1";
    initializePlayer("179, 47, 47");
    return;
  }
  if (!participants.find((p) => p.role === "player2")) {
    my.role = "player2";
    initializePlayer("47, 124, 179");
    return;
  }
}

function stepHost(){
  shared.isRunning = false;
  shared.badge = { // initialize the badge
    pos_x: (SITE.right + SITE.left) / 2,
    pos_y: (SITE.bottom + SITE.top) / 2,
    vel_x: 0,
    vel_y: 0,
    dir: random(360),
    size: BADGE_SIZE,
    isPicked: false
  }

  resetGameTimer();
  bullets.bullets = [];
}

function initializePlayer(col = '255, 255, 255'){
  my.enabled = false; // if the player is playing the game
  my.id = round(random(100)); // assign a unique ID to the player
  my.score = 0;
  my.isWin = false;
  my.alive = false; // if the player is alive

  // initialize the character
  my.origin = {
    pos_x: -200, // x postion
    pos_y: -200, // y postion
    vel_x: 0,
    vel_y: 0,
    dir: "right", // face direction
    ifMove: false,
    size: CHARACTER_SIZE,
    color: col,
    reload: 0, // reloading cooldown timer
    stunned: 0, // stunned cooldown timer
    hasBadge: false // if the character has the badge
  };
  
  my.newBullet = [], // bullets waiting to be update
  my.startPos = {x: 0, y: 0};
  my.clones = [];
}

function mouseReleased() {
  if (gameState === "TITLE") {
    gameState = "MENU";
  }
}