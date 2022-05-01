
// Subscribed Functions
function restartLocalPlayer() { // reset player state in a new GAME
  // reset the player's score
  my.score = 0;
  my.isWin = false;
  // clear local commands
  local_commands = [];
  await_commands = [];
  // clear all the clones
  my.clones = [];

  my.enabled = true; // enable the player
}
function resetLocalPlayer() { // reset player state in a new ROUND
    // create a new clone (start from the 2nd round)
    if(CLONE_MODE_ON && timer.roundCount > 1) {
      my.clones.push({
        cloneId: my.id + '#' + (timer.roundCount - 1),
        startPos: my.startPos,
        frame: 0,
        alive: true,
        pos_x: my.startPos.x, // x postion
        pos_y: my.startPos.y, // y postion
        vol_x: 0,
        vol_y: 0,
        dir: random(360), // face direction
        size: CHARACTER_SIZE,
        color: my.origin.color,
        reload: 0, // reloading cooldown timer
        stunned: 0, // stunned cooldown timer
        hasStar: false // if the character has the star
      });
    }
    // reset all the clones
    if(my.clones.length > 0) {
      for(let copy of my.clones) {
        copy.frame = 0;
        copy.alive = true,
        copy.hasStar = false;
        copy.pos_x = copy.startPos.x;
        copy.pos_y = copy.startPos.y;
      }
    }
  
    my.alive = true;
    my.origin.hasStar = false;
    my.origin.pos_x = random() < 0.5 ? 50 : width - 50;
    my.origin.pos_y = random() < 0.5 ? 50 : height - 50;
    my.startPos = {x: my.origin.pos_x, y: my.origin.pos_y};
    
    // create a new command collection
    local_commands.push([]);
  }
  
function trackPlayer(commands) {
  if(local_commands.length >= timer.roundCount && commands)
    local_commands[local_commands.length - 1].push(commands);
}

function stun(param) { // param: [entity id, repulsing direction]
    // check the ID (local player or any local clone)
    if(typeof(param[0]) == 'string') {
      let chars = param[0].split('#');
      if(my.id == chars[0]) await_commands.push("stun#" + chars[1]);
    } else {
      if(my.id == param[0]) await_commands.push("stun#0#" + param[1]);
    }
}

// Player Controls
function keyPressed() {
    // when host presses ENTER, start Game
    if(partyIsHost() && keyIsDown(13) && !shared.isRunning) startGame(); 
    if(partyIsHost() && keyIsDown(13) && shared.isRunning && timer.roundState == "inbetween") startRound(); 
}
  
function mousePressed() {
    // shoot a bullet
    if(my.enabled && my.alive && my.origin.reload === 0 && my.origin.stunned === 0 && timer.roundState !== "inbetween") {

      // calculate the aimming direction
      let vec = createVector(mouseX - my.origin.pos_x, mouseY - my.origin.pos_y);
      let direct = NORMAL_VEC.angleBetween(vec);
      
      my.newBullet.push({ // create a new bullet
        id: my.id,
        pos_x: my.origin.pos_x, 
        pos_y: my.origin.pos_y,
        vol: BULLET_VOL,
        dir: direct,
        size: BULLET_SIZE,
        color: my.origin.color
      });
      // start reloading
     my.origin.reload = RELOAD_TIMER; // start reloading
  
      // add shoot command in this frame
        if(CLONE_MODE_ON) {
            let last_command = local_commands[local_commands.length - 1].length - 1;
            local_commands[local_commands.length - 1][last_command].push(true);
        }
    }
}