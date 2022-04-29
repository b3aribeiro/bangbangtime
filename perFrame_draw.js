function updateGameVisual() {

    if (timer.syncReady){//after syncing data finished

      // draw all the ENABLED players
      for(let p of participants) {
        if(p.enabled) {
          drawEntity(p.origin);
        }
      }
  
      // draw all local clones
      if(clones.length > 0) {
        for(let copy of clones) {
          if(copy.alive) drawEntity(copy);
        }
      }
      
      // draw bullets
      if(bullets.length > 0)
        for(let bu of bullets) drawBullet(bu);
      // draw the star
      if(!shared.star.isPicked) drawStar(shared.star);
    }

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


