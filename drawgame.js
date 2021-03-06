//This js file will be deleted once we organize its contents

function drawGame(){
  
    if(shared.isRunning) {
      partyToggleInfo(false);
      image(ASSETS_MANAGER.get("background"), 0, 0); // always draw the background
      if (timer.roundState == "start"){
          if(timer.resetLocalPlayerFinished){ //draw game after reset has finished

            updateGameObjects();
            updateGameVisual();
      
            updateStats();

          }

      }else{

        //display in between screens;
        drawInBetweenScreen();

        //update timer
        if(partyIsHost()){ 
          updateInbetweenTimer();
        }
      
      }
    }
    
    if (!shared.isRunning) {
      if(timer.roundCount === 0) {

        //wait for players to start the game
        drawStartScreen();

      } else { 
        // game over
        partyToggleInfo(true);
        drawEndScreen();

      }
    }

  }