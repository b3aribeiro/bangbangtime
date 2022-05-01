function drawStar(star, canvas = window) {
    canvas.push();
    canvas.image(ASSETS_MANAGER.get("star"), star.pos_x  - star.size/1.5, star.pos_y - star.size/1.5, star.size + 10 ,star.size + 10);
    canvas.pop();
}

// TO DO: Review and update the Star object once play who is holding the star is hit
function updateStar(obj) {
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

function resetStar(type){
  if(type == "random"){
    shared.star.pos_x = floor(random(width));
    shared.star.pos_y = floor(random(height));
    shared.star.isPicked = false;
  } else if (type == "center"){
    shared.star.pos_x = width / 2;
    shared.star.pos_y = height / 2;
    shared.star.isPicked = false;
  }
}

function starIsPicked(body){
  shared.star.isPicked = true;
  body.hasStar = true;
  my.score ++;
}

function starIsLost(body){
  body.hasStar = false;
  resetStar("random");
  my.score --;
}

//check if my or my clones hasStar
//called at the end of each round
function ifHasStar(){

    if(my.origin.hasStar) return true;

    if  (my.clones.length > 0){ // also check if any of the player's clones has the star

        for(let copy of my.clones) {
          if(copy.hasStar) {
            return true
          }
        }
      }

    return false;
  
}