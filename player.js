
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

  if(my.role !== "observer") my.enabled = true; // enable the players who are not observers
}
function resetLocalPlayer() { // reset player state in a new ROUND
  if(my.enabled) {
    // create a new clone (start from the 2nd round)
    if(CLONE_MODE_ON && timer.roundCount > 1) {
      my.clones.push({
        cloneId: my.id + '#' + (timer.roundCount - 1),
        startPos: my.startPos,
        frame: 0,
        alive: true,
        pos_x: my.startPos.x, // x postion
        pos_y: my.startPos.y, // y postion
        vel_x: 0,
        vel_y: 0,
        dir: "right", // face direction
        ifMove: false,
        size: CHARACTER_SIZE,
        color: my.origin.color,
        reload: 0, // reloading cooldown timer
        stunned: 0, // stunned cooldown timer
        hasBadge: false // if the character has the badge
      });
    }
    // reset all the clones
    if(my.clones.length > 0) {
      for(let copy of my.clones) {
        copy.frame = 0;
        copy.alive = true,
        copy.hasBadge = false;
        copy.pos_x = copy.startPos.x;
        copy.pos_y = copy.startPos.y;
        copy.dir = "right";
        copy.ifMove = false;
      }
    }
  
    my.alive = true;
    my.origin.hasBadge = false;

    // select a new spawn point
    let newSpawn = [];
    if(my.role === "player1") newSpawn = shared.spawnPts[timer.roundCount - 1];
    else newSpawn = shared.spawnPts[shared.spawnPts.length / 2 + timer.roundCount - 1];
    my.origin.pos_x = newSpawn[0];
    my.origin.pos_y = newSpawn[1];
    my.startPos = {x: my.origin.pos_x, y: my.origin.pos_y};
    
    // create a new command collection
    local_commands.push([]);
  }
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

}
  
function mousePressed() {
    // shoot a bullet
    if(my.enabled && my.alive && my.origin.reload === 0 && my.origin.stunned === 0 && timer.roundState == "start" && timer.resetLocalPlayerFinished) {
      
      partyEmit("playSound", "sound_shoot");
      
      // calculate the aimming direction
      let vec = createVector(mouseX - my.origin.pos_x, mouseY - my.origin.pos_y);
      let direct = NORMAL_VEC.angleBetween(vec);
      // change the player's direction
      // if(mouseX > my.origin.pos_x && my.origin.dir === "left") my.origin.dir = "right";
      // else if(mouseX < my.origin.pos_x && my.origin.dir === "right") my.origin.dir = "left";
      
      my.newBullet.push({ // create a new bullet
        id: my.id,
        pos_x: my.origin.pos_x, 
        pos_y: my.origin.pos_y,
        vel: BULLET_VEL,
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