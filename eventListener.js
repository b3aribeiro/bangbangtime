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
      
      let newBullet = { // create a new bullet
        id: my.id,
        pos_x: my.origin.pos_x, 
        pos_y: my.origin.pos_y,
        vol: BULLET_VOL,
        dir: direct,
        size: BULLET_SIZE,
        color: my.origin.color
      }

      partyEmit("downloadBullets", newBullet)
      
      // add shoot command in this frame
        if(CLONE_MODE_ON) {
            let last_command = local_commands[local_commands.length - 1].length - 1;
            local_commands[local_commands.length - 1][last_command].push(true);
        }

      // start reloading
      my.origin.reload = RELOAD_TIMER;
    }
}