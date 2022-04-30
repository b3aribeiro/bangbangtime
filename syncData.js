
// Subscribed Functions
function restartLocalPlayer() { // reset player state in a new GAME
    // reset the player's score
    my.score = 0;
    my.isWin = false;

    // clear local commands
    local_commands = [];
    await_commands = [];
  
    my.commands = {} //clear my commands collection

    local_commands_all = new Map(); //local clones commands collection
    clones = new Array(); //local clones obj
    bullets = new Array();//local bullets
  
    my.enabled = true; // enable the player
  }

  function resetLocalPlayer() { // reset player state in a new ROUND


      my.alive = true;
      my.origin.hasStar = false;
      my.origin.pos_x = random() < 0.5 ? 50 : width - 50;
      my.origin.pos_y = random() < 0.5 ? 50 : height - 50;
      my.startPos = {x: my.origin.pos_x, y: my.origin.pos_y};
      
      // create a new command collection
      local_commands.push([]);


    }
  
  
  function uploadCommands(){
    my.commands = {} //clear my commands collection
  
    if(CLONE_MODE_ON && timer.roundCount > 1) {
      let cloneid = my.id + '#' + (timer.roundCount - 1);
      my.commands = { 
        "cloneid": cloneid,
        "commands" : local_commands[local_commands.length-1] }
      }
  
  }
  
  function downloadCommands(){
  
   //download all participants[].commands to local variable: local_commands_all
   //and register new local clones

   if(timer.roundCount > 1) {
        participants.forEach((p)=>{
          if (p.enabled && p.commands){ //active player
        
              local_commands_all.set(p.commands.cloneid, p.commands.commands)

              let newClone = {
                cloneId: p.id + '#' + (timer.roundCount - 1), //TO DO: why use p.commands.cloneid might cause undefined error
                startPos: p.startPos,
                frame: 0,
                alive: true,
                pos_x: p.origin.pos_x, // x postion
                pos_y: p.origin.pos_x, // y postion
                vol_x: 0,
                vol_y: 0,
                dir: random(360), // face direction
                size: CHARACTER_SIZE,
                color: p.origin.color,
                reload: 0, // reloading cooldown timer
                stunned: 0, // stunned cooldown timer
                hasStar: false // if the character has the star
              }


              clones.push( JSON.parse(JSON.stringify(newClone)) ); //deep clone

          }
          
        })
        
        //reset all local clones
        if(clones.length > 0) {
        
          for(let copy of clones) {

            copy.frame = 0;
            copy.alive = true,
            copy.hasStar = false;
            copy.pos_x = copy.startPos.x;
            copy.pos_y = copy.startPos.y;
            copy.reload= 0; // reloading cooldown timer
            copy.stunned= 0; // stunned cooldown timer
          }
        }

        console.log(clones, "clones")
      }


  }