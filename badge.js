function drawBadge(badge, canvas = window) {
    canvas.push();
    canvas.imageMode(CENTER);
    // canvas.fill(20, 130);
    // canvas.ellipse(badge.pos_x, badge.pos_y + 2, badge.size * 2.2);
    canvas.image(ASSETS_MANAGER.get("badge"), badge.pos_x, badge.pos_y);
    canvas.pop();
}

// TO DO: Review and update the Badge object once play who is holding the badge is hit
function updateBadge(obj) {
    let vel = obj.vel, dir = obj.dir;
    if(vel > 0) {
        obj.pos_x += vel * cos(dir);
        obj.pos_y += vel * sin(dir);
    if(vel < 1) // check if the velocity is too low
        obj.vel = 0; // stop the obj
    else
        obj.vel = vel - vel / 4; // decelerate
    }
}

function resetBadge(type){
  if(type == "random"){
    shared.badge.pos_x = floor(random(SITE.left, SITE.right));
    shared.badge.pos_y = floor(random(SITE.top, SITE.bottom));
    shared.badge.isPicked = false;
  } else if (type == "center"){
    shared.badge.pos_x = (SITE.right + SITE.left) / 2;
    shared.badge.pos_y = (SITE.bottom + SITE.top) / 2;
    shared.badge.isPicked = false;
  }
}

function badgeIsPicked(body){
  shared.badge.isPicked = true;
  body.hasBadge = true;
  my.score ++;
}

function badgeIsLost(body){
  body.hasBadge = false;
  resetBadge("random");
  my.score --;
}

//check if this player or player's clones hasBadge
//called at the end of each round
function ifHasBadge(p){

    if(p.origin.hasBadge) return true;

    if  (p.clones.length > 0){ // also check if any of the player's clones has the badge

        for(let copy of p.clones) {
          if(copy.hasBadge) {
            return true
          }
        }
      }

    return false;
  
}