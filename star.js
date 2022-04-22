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
