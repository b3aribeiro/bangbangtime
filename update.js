//This js file will be deleted once we organize its contents

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
                partyEmit("stun", [p.id, bu.dir]); // tell the player to get stunned
                bullets.bullets.splice(i, 1); // remove the bullet if it hits a player
                break;
              } else { // check all the clones of the player
                for(let copy of p.clones) {
                  if(copy.alive && copy.cloneId !== bu.id && collideCheck(copy, bu)) {
                    partyEmit("stun", [copy.cloneId]); // tell the player to kill the clone
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
  
      if(!shared.star.isPicked) updateStar(shared.star); // update star
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
            if(copy.alive) drawEntity(copy);
          }
        }
        drawEntity(p.origin);
      }
    }
    
    // draw bullets
    if(bullets.bullets.length > 0)
      for(let bu of bullets.bullets) drawBullet(bu);
    // draw the star
    if(!shared.star.isPicked) drawStar(shared.star);
}

function collideCheck(obj1, obj2) { // check if 2 objects collide
  let x1 = obj1.pos_x, y1 = obj1.pos_y, x2 = obj2.pos_x, y2 = obj2.pos_y;
  let s1 = obj1.size / 2, s2 = obj2.size / 2;
  if(dist(x1, y1, x2, y2) <= s1 + s2) return true;
  else return false;
}