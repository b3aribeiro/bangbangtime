//This js file will be deleted once we organize its contents

function drawGame(){
    background(220);
  
    if(shared.isRunning) {
      image(ASSETS_MANAGER.get("background"), 0, 0); // always draw the background
      if (timer.roundState == "start"){
          if(timer.resetLocalPlayerFinished){ //draw game after reset has finished

            updateGameObjects();
            updateGameVisual();
      
            //update timer
            if(partyIsHost()){ 
              updateTimer();
            }
            //display timer and rounds 
            drawTimer();

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
        drawEndScreen();

      }
    }

  }