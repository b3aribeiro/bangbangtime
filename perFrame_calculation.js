function updateGameObjects(){
  // host update
  if(partyIsHost()) {

    if(!shared.star.isPicked) updateStar(shared.star); // update star
  }

  if(my.enabled) updateLocalClient(); // local update
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

    updateClones(); //move all local clones
    updateBullets(); //move all local bullets and check collisions

  }
}

function updateClones(){
  if(clones.length > 0) {

    for(let i in clones) {
      if(clones[i].alive) { // check if the clone is still alive
        let frame = clones[i].frame;
        let commands = local_commands_all.get(clones[i].cloneId)

        if (commands){//double checking...
          if(frame < commands.length && clones[i].stunned === 0) { // control the clone through history commands

            let playerId = getPlayerIdFromClone(clones[i]);
            let myclone = playerId == my.id ? true : false; //check if this is my clone  
  
            updateEntity(clones[i], commands[frame], myclone);
            clones[i].frame += 1;
          } else { // if the commands have run out, the clone will stay still
            // updateEntity(my.clones[i], [false, false, false, false]);
          }
        }

      }
    }
  }
}


// update an entity's position
function updateEntity(body, commands, isMyClone = false) {
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
  
    if(isMyClone) { // check if the body is my clone
      // if shoot(only check clones)
      if (commands[5]){
        let aimX = commands[4].x, aimY = commands[4].y;
        // calculate the aimming direction
        let vec = createVector(aimX - body.pos_x, aimY - body.pos_y);
        let direct = NORMAL_VEC.angleBetween(vec);

        let newBullet = { // create a new bullet
          id: body.cloneId,
          pos_x: body.pos_x, 
          pos_y: body.pos_y,
          vol: BULLET_VOL,
          dir: direct,
          size: BULLET_SIZE,
          color: body.color
        }
        my.newBullet.push(newBullet);
        partyEmit("downloadBullets", newBullet)
      }
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
  // TO DO: let host check star?

  if(!shared.star.isPicked && ( !body.hasOwnProperty("cloneId") || isMyClone) ) {

    if (collideCheck(body, shared.star)) {
      body.hasStar = true;
      shared.star.isPicked = true; // set the star state to "picked"

      my.score ++; 
    }
  }
}



function trackPlayer(commands) {
  if(local_commands.length >= timer.roundCount)
    local_commands[local_commands.length - 1].push(commands);
}

// check if there is any commands waiting for local client to execute
function checkAwaitingInstruction() {
  for(let cmd of await_commands) {

    if(cmd === "clearBullets") { // clear new bullets
      my.newBullet = [];

    } 
    
    else if(cmd.includes("stunMy")) { // my gets stunned

        my.origin.stunned = STUNNED_TIMER; // stun the player
        // repulse the player
        let newDir = parseInt(cmd.split("##")[1]);
        my.origin.vol_x = cos(newDir) * CHARACTER_VOL;
        my.origin.vol_y = sin(newDir) * CHARACTER_VOL;
        // if the player has the star, reset position for badge
        if(my.origin.hasStar) {
          my.origin.hasStar = false;
          resetStar("random");
          my.score --;
        }
      }
      
  else {//clones get stunned

      let thisCloneId = cmd.split("##")[1];
      let thisPlayerId = parseInt(thisCloneId.split("#")[0])

      let copy = clones.find( (c) => c.cloneId == thisCloneId) 

      copy.alive = false; // kill the corresponding clone immediately

      // if 1. this is my clone, 2.the clone has the star, reset position for badge
      if(copy.hasStar && thisPlayerId === my.id) {
          copy.hasStar = false;
          resetStar("random");
          my.score --;
      }
  }
 
  }
  await_commands = []; // reset commands
}