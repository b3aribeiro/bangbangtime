// update the position of a bullet
function moveBullet(bullet) {
    let vol = bullet.vol, dir = bullet.dir;
    bullet.pos_x += vol * cos(dir);
    bullet.pos_y += vol * sin(dir);
}
  
function drawBullet(bullet, canvas = window) {
    canvas.push();
    canvas.fill(bullet.color, 180, 160);
    canvas.ellipse(bullet.pos_x, bullet.pos_y, bullet.size);
    canvas.pop();
}

function ifInCanvas(obj) { // check if an bullet is in the canvas
    let x = obj.pos_x, y = obj.pos_y, s = obj.size;
    if(x + s < 0 || x - s > width || y + s < 0 || y - s > height)
      return false;
    else return true;
}

function clearBullets(id) {
  if(my.id === id)
      await_commands.push("clearBullets");
}

function clearThisBullet(bullet){
  bullets = bullets.filter( (bu)=> bu.id !== bullet.id)
}


function checkBulletHit(){
  // this function is called locally
  // to check if the bullet hits any player or clone

  bullets.forEach(function(bu, i){

    //check my 
      if(my.enabled && my.alive && my.id !== bu.id && collideCheck(my.origin, bu)) {
        stun([my.id, bu.dir]); // tell the player to get stunned
        bullets.splice(i, 1); // remove the bullet if it hits a player
        //tell other players to remove the bullets
        partyEmit("clearThisBullet", bu );
      }


    //check clones
    for(let copy of clones) {
      if(copy.alive && copy.cloneId !== bu.id && collideCheck(copy, bu)) {
        // partyEmit("stun", [copy.cloneId]); // tell the player to kill the clone

        stun([copy.cloneId])
        bullets.splice(i, 1); // remove the bullet if it hits a player
        break;
      }
    }
  
  })
}

function updateBullets(){
        
        // move bullets
        if(bullets.length > 0) {

          bullets.forEach(function(bu, i){
            if(ifInCanvas(bu)) { // check if the bullet is still in the canvas

            
              moveBullet(bu); // move the bullet

            } else {
              bullets.splice(i, 1); // remove the bullet if it leaves the canvas
            }
          });
        }

        //check collision
        checkBulletHit();
}


function downloadBullets(newBullet){
  bullets.push(Object.assign({}, newBullet));
}

