

// Game State Management

function startGame() {
  bullet_cooldown_id = {};
  
  // initialzie/reset all the players
  partyEmit("restartLocalClients");
  for(let p of participants)
    bullet_cooldown_id[p.id] = 0;
  
  // start the timer
  shared.isRunning = true; // start the game

  resetGameTimer();

  startRound();
}

function endGame() {
  // check who is the winner
  whoIsWinner();

  for(let p of participants) {
    p.enabled = false; // disable the player
  }

  shared.isRunning = false; // stop the game
}


function startRound(){

  resetRoundTimer();

  // reset the position of the star
  resetStar("center");

  // clear all the bullets on the canvas
  partySetShared(bullets, {bullets: []});

  // reset all the players
  setTimeout(function() {
    partyEmit("resetLocalClients");
  }, 100);

  // signal reset has finished
  setTimeout(function() {  
    timer.resetLocalPlayerFinished = true;
  }, 300);
    
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
    // check the command (['LEFT', 'RIGHT', 'UP', 'DOWN', ${mouse_position}, ${ifShoot}])
    if(abs(body.vol_x) < CHARACTER_VOL) {
      if(commands[0]) body.vol_x -= CHARACTER_ACL;
      if(commands[1]) body.vol_x += CHARACTER_ACL;
    }
    if(abs(body.vol_y) < CHARACTER_VOL) {
      if(commands[2]) body.vol_y -= CHARACTER_ACL;
      if(commands[3]) body.vol_y += CHARACTER_ACL;
    }
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
  
  // update the entity's face direction
  // body.dir = NORMAL_VEC.angleBetween(commands[4]);
  // update the entity's position
  body.pos_x += body.vol_x;
  body.pos_y += body.vol_y;
  if(body.pos_x < body.size/2) body.pos_x = body.size/2;
  else if(body.pos_x > width - body.size/2) body.pos_x = width - body.size/2;
  if(body.pos_y < body.size/2) body.pos_y = body.size/2;
  else if(body.pos_y > height - body.size/2) body.pos_y = height - body.size/2;
  // update the entity's velocity
  if(abs(body.vol_x) < CHARACTER_ACL / 2) body.vol_x = 0;
  else if(body.vol_x > 0) body.vol_x -= CHARACTER_ACL / 2;
  else if(body.vol_x < 0) body.vol_x += CHARACTER_ACL / 2;
  if(abs(body.vol_y) < CHARACTER_ACL / 2) body.vol_y = 0;
  else if(body.vol_y > 0) body.vol_y -= CHARACTER_ACL / 2;
  else if(body.vol_y < 0) body.vol_y += CHARACTER_ACL / 2;

  // update reload & stunned timer
  if(body.reload > 0) body.reload --;
  if(body.stunned > 0) body.stunned --;

  // check if the entity collides the star
  if(!shared.star.isPicked && collideCheck(body, shared.star)) {
    starIsPicked(body)
  }
}

// check if there is any commands waiting for local client to execute
function checkAwaitingInstruction() {
  for(let cmd of await_commands) {
    if(cmd === "clearBullets") { // clear new bullets
      my.newBullet = [];
    } else if(cmd.search("stun") !== -1) { // player gets stunned
      let cmds = cmd.split('#');
      let ID = parseInt(cmds[1]);
      if(ID == 0) {
        my.origin.stunned = STUNNED_TIMER; // stun the player
        // repulse the player
        let newDir = parseInt(cmds[2]);
        my.origin.vol_x = cos(newDir) * CHARACTER_VOL;
        my.origin.vol_y = sin(newDir) * CHARACTER_VOL;
        // if the player has the star, reset position for badge
        if(my.origin.hasStar) {
          starIsLost(my.origin)
        }
      } else {
        let copy = my.clones[ID - 1];
        copy.alive = false; // kill the corresponding clone immediately
        // if the clone has the star, reset position for badge
        if(copy.hasStar) {
          starIsLost(copy)
        }
      }
    }
  }
  await_commands = []; // reset commands
}

// Visualization Functions
function drawEntity(body, canvas = window) {
  canvas.push();
  let alp = 255;
  if(body.hasOwnProperty("cloneId")) alp = 120; // if it's a clone, make it a little transparent 
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

function whoIsWinner() { // make the player who has the highest score become winner
  let highscore = 0;
  for(let p of participants) {
    if(p.score > highscore) highscore = p.score;
  }
  for(let p of participants) {
    if(p.score === highscore) p.isWin = true;
  }
}