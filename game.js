

// Game State Management

function startGame() {
  bullet_cooldown_id = {};
  // initialzie all the players
  for(let p of participants) {
    // reset the player's score
    p.score = 0;
    p.isWin = false;
    
    p.enabled = true; // enable the player
    bullet_cooldown_id[p.id] = 0;
  }
  // start the timer
  shared.isRunning = true; // start the game
  startRound();
}

function endGame() {
  for(let p of participants) {
    p.enabled = false; // disable the player
  }
  shared.isRunning = false; // stop the game
}

function startRound() {
  // check if any player has win the game
  for(let p of participants) {
    if(p.origin.hasStar) {
      if(p.score + 1 >= WINNING_SCORE) { // if the player's score reaches to the winning score, end the game immediately
        p.isWin = true;
        endGame();
      } else p.score ++;
    }
  }

  // initialize a new round
  timer.count = ROUND_DURATION;
  timer.roundCount += 1; // round +1
  timer.roundFrame = 0; // reset the round frame
  
  // reset all the players
  setTimeout(function() {
    partyEmit("resetLocalClients");
  }, 100);
  // reset the position of the star
  shared.star.pos_x = width / 2;
  shared.star.pos_y = width / 2;
  shared.star.isPicked = false;

  // clear all the bullets on the canvas
  partySetShared(bullets, {bullets: []});
}

// Local Client Management

function updateLocalClient() {
  // check if received any instruction from the host
  if(await_commands.length > 0) checkAwaitingInstruction();
  
  if(my.enabled) {
    // check player's input
    let commands = [];
    // command: ['LEFT', 'RIGHT', 'UP', 'DOWN', ${mouse_position}]
    if(keyIsDown(65) || keyIsDown(37)) commands.push(true);
    else commands.push(false);
    if(keyIsDown(68) || keyIsDown(39)) commands.push(true);
    else commands.push(false);
    if(keyIsDown(87) || keyIsDown(38)) commands.push(true);
    else commands.push(false);
    if(keyIsDown(83) || keyIsDown(40)) commands.push(true);
    else commands.push(false);
    // add mouse position
    commands.push({x: mouseX, y: mouseY});

    // update the local player's position
    updateEntity(my.origin, commands);

    // record the local player's trace
    if(CLONE_MODE_ON) trackPlayer(commands);
    // update all the local clones
    if(my.clones.length > 0) {
      for(let i in my.clones) {
        if(my.clones[i].alive) { // check if the clone is still alive
          let frame = my.clones[i].frame;
          if(frame < local_commands[i].length && my.clones[i].stunned === 0) { // control the clone through history commands
            updateEntity(my.clones[i], local_commands[i][frame]);
            my.clones[i].frame += 1;
          } else { // if the commands have run out, the clone will stay still
            // updateEntity(my.clones[i], [false, false, false, false]);
          }
        }
      }
    }
  }
}

// update an entity's position
function updateEntity(body, commands) {
  if(body.stunned <= 0) { // if the player is not stunned
    // check the command (['LEFT', 'RIGHT', 'UP', 'DOWN', ${mouse_position}, (optional)${ifShoot}])
    if(commands[0] && body.pos_x > body.size/2) body.pos_x -= body.vol;
    if(commands[1] && body.pos_x < width - body.size/2) body.pos_x += body.vol;
    if(commands[2] && body.pos_y > body.size/2) body.pos_y -= body.vol;
    if(commands[3] && body.pos_y < height - body.size/2) body.pos_y += body.vol;
    // if shoot(only check clones)
    if(body.hasOwnProperty("cloneId") && commands[5]) { // check if the body is a clone
      let aimX = commands[4].x, aimY = commands[4].y;
      // calculate the aimming direction
      let vec = createVector(aimX - body.pos_x, aimY - body.pos_y);
      let direct = NORMAL_VEC.angleBetween(vec);
      my.newBullet.push({ // create a new bullet
        id: body.cloneId,
        pos_x: body.pos_x, 
        pos_y: body.pos_y,
        vol: BULLET_VOL,
        dir: direct,
        size: BULLET_SIZE,
        color: body.color
      });
    }
  }
  
  // change the entity's face direction
  // body.dir = NORMAL_VEC.angleBetween(commands[4]);
  // update reload & stunned timer
  if(body.reload > 0) body.reload --;
  if(body.stunned > 0) body.stunned --;

  // check if the entity collides the star
  if(!shared.star.isPicked && collideCheck(body, shared.star)) {
    body.hasStar = true;
    shared.star.isPicked = true; // set the star state to "picked"
  }
}

// check if there is any commands waiting for local client to execute
function checkAwaitingInstruction() {
  for(let cmd of await_commands) {
    if(cmd === "clearBullets") { // clear new bullets
      my.newBullet = [];
    } else if(cmd.search("stun") !== -1) { // player gets stunned
      console.log(cmd);
      let ID = parseInt(cmd.split('#')[1]);
      if(ID == 0) {
        my.origin.stunned = STUNNED_TIMER; // stun the player
      } else {
        my.clones[ID - 1].alive = false; // kill the corresponding clone immediately
      }
    }
  }
  await_commands = []; // reset commands
}

// Visualization Functions
function drawEntity(body, score, canvas = window) {
  canvas.push();
  let alp = 255;
  if(body.hasOwnProperty("cloneId")) {
    alp = 120;
    if(!body.alive) alp = 20;
  }
  //if(my.role == "player2")
  canvas.fill(body.color, 220, 180, alp);
  canvas.ellipse(body.pos_x, body.pos_y, body.size);   
  
  canvas.image(ASSETS_MANAGER.get("hat"), body.pos_x - body.size/1.25,      
  body.pos_y - body.size - 5 , body.size*1.6, body.size);
  canvas.image(ASSETS_MANAGER.get("mask"), body.pos_x - body.size/2,      
  body.pos_y-5, body.size, body.size);
  
  if(body.reload > 0) { // draw reloading bar
    canvas.fill(120, 220, 120);
    canvas.rect(body.pos_x, body.pos_y - CHARACTER_SIZE / 2, body.reload / RELOAD_TIMER * CHARACTER_SIZE, 10);
  }
  
  if(body.stunned > 0) { // draw stunned bar
    canvas.fill(220, 120, 120);
    canvas.rect(body.pos_x, body.pos_y - CHARACTER_SIZE / 2 - 12, body.stunned / STUNNED_TIMER * CHARACTER_SIZE, 10);
  }

  canvas.pop();
}