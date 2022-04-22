// update the position of a bullet
function updateBullet(bullet) {
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