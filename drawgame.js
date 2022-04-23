//This js file will be deleted once we organize its contents

function drawGame(){
    background(220);
  
    if(shared.isRunning) {
      updateGameObjects();
      updateGameVisual();

      //GAME STATE MGMT:
      //update timer
      if(partyIsHost()){ 
        updateTimer();
      }
      //display timer and rounds 
      drawTimer();

    }
    
    if (!shared.isRunning) {
      if(timer.roundCount === 0) {

        //wait for players to start the game
        drawStartScreen();

      } else { 
        // game over
        drawEndScreen();

      }
    }

  }