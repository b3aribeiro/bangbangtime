function drawGame(){
  background(220);

  if(shared.isRunning) {
    // console.log("shared running?")
    // console.log(shared.isRunning)
    updateGameObjects();
    updateGameVisual();
  }
  
  if (!shared.isRunning) {
    if(timer.roundCount === 0) {
      if(partyIsHost()){
        push()
        textSize(30);
        text('Take control of your city, Sherif!', 300, 300);
        text('Press ENTER to defend it.', 300, 330);
        pop()

      }else{
        push()
        textSize(20);
        text('The Sherif looking for a bandit like you...', 300, 300);
        text('Get ready to show who should control this town', 300, 320);
        pop()
      }
    } else { // game end, display winner
      let result = my.isWin ? 'win!' : 'lose!';
      push()
      fill(0)
      textSize(16);
      textAlign(CENTER);
      text(`You ${result}`, 300, 300);
      pop()
      if(partyIsHost()){
        push()
        fill(0)
        textSize(16);
        textAlign(CENTER);
        text(`you are the host, press ENTER to start the game`, 300, 350);
        pop()
        // console.log("LMK When it kits !shared with party host - game end")
      }else{
        push()
        fill(0)
        textSize(16);
        textAlign(CENTER);
        text(`wait for the host to start the game`, 300, 350);
        pop()
        // console.log("LMK When it kits !shared with party host - game end")
      }
    }
  } else {
    
  // console.log("else what?")
  // console.log(shared.isRunning)
    //display timer and rounds 
    push()
    fill(0)
    rect(0,580,width*2, 50)
    fill(255)
    textSize(20);
    textAlign(CENTER);
    text( `Current Round ${timer.roundCount}/10`, 100, 570);
    
    text( `${my.score}`, 500, 570);
    text( `${timer.count}`, 300, 570);
    textFont('Helvetica');
    text( "🕰️", 320, 575);
    text( `✶`, 520, 573);
    pop()
    
    if(partyIsHost()){ // update countdown

      if(timer.roundFrame % FRAME_RATE === 0) timer.count -= 1; // countdown
      timer.roundFrame ++; // add frame count

      if(timer.count <= -1) {
        if (timer.roundCount < ROUND_TOTAL)
          startRound();
        else
          endGame();
      }
    }
  } // end timer
}

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

function updateGameObjects(){
  // host update
  if(partyIsHost()) {
    // check if the player has any pending bullet
    for(let p of participants) {
      if(p.enabled) {
        // check if the player has any pending bullet
        if(p.newBullet.length > 0 && bullet_cooldown_id[p.id] <= 0) {
          p.newBullet.forEach((bu) => bullets.bullets.push(Object.assign({}, bu))); // push new bullets to shared bullets
          partyEmit("clearBullets", p.id); // tell the player to clear newBullet list
          bullet_cooldown_id[p.id] = 6; // avoid repeat push; 5 frames tolerance
        }
        bullet_cooldown_id[p.id] = max(bullet_cooldown_id[p.id] - 1, 0);
      }
    }
    // update bullets
    if(bullets.bullets.length > 0) {
      bullets.bullets.forEach(function(bu, i){
        if(ifInCanvas(bu)) { // check if the bullet is still in the canvas
          updateBullet(bu); // move the bullet
          // check if the bullet hits any player or clone
          for(let p of participants)
            if(p.enabled && p.alive && p.id !== bu.id && collideCheck(p.origin, bu)) {
              partyEmit("stun", p.id); // tell the player to get stunned
              bullets.bullets.splice(i, 1); // remove the bullet if it hits a player
              break;
            } else { // check all the clones of the player
              for(let copy of p.clones) {
                if(copy.alive && copy.cloneId !== bu.id && collideCheck(copy, bu)) {
                  partyEmit("stun", copy.cloneId); // tell the player to kill the clone
                  bullets.bullets.splice(i, 1); // remove the bullet if it hits a player
                  break;
                }
              }
            }
        } else {
          bullets.bullets.splice(i, 1); // remove the bullet if it leaves the canvas
        }
      });
    }
    // update star
    if(!shared.star.isPicked) updateObj(shared.star);
  }

  if(my.enabled) updateLocalClient(); // local update
}
function updateGameVisual() {
  // draw all the ENABLED players
  for(let p of participants) {
    if(p.enabled) {
      // draw player clones
      if(p.clones.length > 0) {
        for(let copy of p.clones) {
          drawEntity(copy);
        }
      }
      drawEntity(p.origin, p.score);
    }
  }
  
  // draw bullets
  if(bullets.bullets.length > 0)
    for(let bu of bullets.bullets) drawBullet(bu);
  // draw the star
  if(!shared.star.isPicked) drawStar(shared.star);
}

// Player Controls

function keyPressed() {
  // when host presses ENTER, start Game
  if(partyIsHost() && keyIsDown(13) && !shared.isRunning) startGame(); 
}

function mousePressed() {
  
  // shoot a bullet
  if(my.enabled && my.alive && my.origin.reload === 0 && my.origin.stunned === 0) {
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

function trackPlayer(commands) {
  if(local_commands.length >= timer.roundCount)
    local_commands[local_commands.length - 1].push(commands);
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
// update the position of a bullet
function updateBullet(bullet) {
  let vol = bullet.vol, dir = bullet.dir;
  bullet.pos_x += vol * cos(dir);
  bullet.pos_y += vol * sin(dir);
}
// update an physic object
function updateObj(obj) {
  let vol = obj.vol, dir = obj.dir;
  if(vol > 0) {
    obj.pos_x += vol * cos(dir);
    obj.pos_y += vol * sin(dir);
    if(vol < 1) // check if the velocity is too low
      obj.vol = 0; // stop the obj
    else
      obj.vol = vol - vol / 4; // decelerate
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
  //if(participants.role == "player2")
  canvas.fill(body.color, 220, 180, alp);
  canvas.ellipse(body.pos_x, body.pos_y, body.size);   
  
  canvas.image(ASSETS_manager.get("hat"), body.pos_x - body.size/1.25,      
  body.pos_y - body.size - 5 , body.size*1.6, body.size);
  canvas.image(ASSETS_manager.get("mask"), body.pos_x - body.size/2,      
  body.pos_y-5, body.size, body.size);
  
    if(body.reload > 0) { // draw reloading bar
      canvas.fill(120, 220, 120);
      canvas.rect(body.pos_x, body.pos_y - CHARACTER_SIZE / 2, body.reload / RELOAD_TIMER * CHARACTER_SIZE, 10);
    }
  
    if(body.stunned > 0) { // draw stunned bar
      canvas.fill(220, 120, 120);
      canvas.rect(body.pos_x, body.pos_y - CHARACTER_SIZE / 2 - 12, body.stunned / STUNNED_TIMER * CHARACTER_SIZE, 10);
    }
  
  // show the player's score
  // canvas.fill(255);
  // canvas.textSize(16);
  // canvas.text(score, body.pos_x, body.pos_y)
  // canvas.pop();
}

function drawBullet(bullet, canvas = window) {
  canvas.push();
  canvas.fill(bullet.color, 180, 160);
  canvas.ellipse(bullet.pos_x, bullet.pos_y, bullet.size);
  canvas.pop();
}

function drawStar(star, canvas = window) {
  canvas.push();
  // canvas.fill(255);
  // canvas.rect(star.pos_x, star.pos_y, star.size + 5, star.size + 5);
  canvas.image(ASSETS_manager.get("star"), star.pos_x  - star.size/1.5, star.pos_y - star.size/1.5, star.size + 10 ,star.size + 10);
  canvas.pop();
}

// Auxilliar Functions
function collideCheck(obj1, obj2) { // check if 2 objects collide
  let x1 = obj1.pos_x, y1 = obj1.pos_y, x2 = obj2.pos_x, y2 = obj2.pos_y;
  let s1 = obj1.size / 2, s2 = obj2.size / 2;
  if(dist(x1, y1, x2, y2) <= s1 + s2) return true;
  else return false;
}

function ifInCanvas(obj) { // check if an object is in the canvas
  let x = obj.pos_x, y = obj.pos_y, s = obj.size;
  if(x + s < 0 || x - s > width || y + s < 0 || y - s > height)
    return false;
  else return true;
}

// Subscribed Functions

function resetLocalPlayer() {
  // create a new clone (start from the 2nd round)
  if(CLONE_MODE_ON && timer.roundCount > 1) {
    my.clones.push({
      cloneId: my.id + '#' + (timer.roundCount - 1),
      startPos: my.startPos,
      frame: 0,
      alive: true,
      pos_x: my.startPos.x, // x postion
      pos_y: my.startPos.y, // y postion
      vol: CHARACTER_VOL,
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
function clearBullets(id) {
  if(my.id === id)
    await_commands.push("clearBullets");
}
function stun(id) {
  // check the ID (local player or any local clone)
  if(typeof(id) == 'string') {
    let ids = id.split('#');
    if(my.id == ids[0]) await_commands.push("stun#" + ids[1]);
  } else {
    if(my.id == id) await_commands.push("stun#0");
  }
}
