function getPlayerIdFromClone(clone){

    return parseInt(clone.cloneId.split('#')[0]);
}

function collideCheck(obj1, obj2) { // check if 2 objects collide
    let x1 = obj1.pos_x, y1 = obj1.pos_y, x2 = obj2.pos_x, y2 = obj2.pos_y;
    let s1 = obj1.size / 2, s2 = obj2.size / 2;
    if(dist(x1, y1, x2, y2) <= s1 + s2) return true;
    else return false;
  }

function stun(param) { // param: [entity id, repulsing direction]

    // check if clones or player being stunned:

    if(typeof(param[0]) == 'string') {
      //clones
      await_commands.push("stunClone##" + param[0]); 
        
    } else {
      //player
      await_commands.push("stunMy##" + param[1]);
    }
}
