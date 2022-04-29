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


// Game State Management

function startGame() {
  bullet_cooldown_id = {};
  
  // initialzie/reset all the players
  partyEmit("restartLocalClients");

  for(let p of participants)
    bullet_cooldown_id[p.id] = 0;
  
  // start the timer
  shared.isRunning = true; // start the game

  resetGameTimer();

  startRound();
}

function endGame() {
  // check who is the winner
  whoIsWinner();

  for(let p of participants) {
    p.enabled = false; // disable the player
  }

  shared.isRunning = false; // stop the game
}



function startRound() {
  // check who won this round
  // updateScore();

  // initialize a new round
  resetRoundTimer();
  
  // reset all the players
  setTimeout(function() {
    partyEmit("uploadCommands");
  }, 100);

  setTimeout(function() {
    partyEmit("downloadCommands");
  }, 200);

  setTimeout(function() {
    partyEmit("resetLocalClients");
    syncFinishedTimer();
  }, 300);

  // reset the position of the star
  resetStar("center");

  // clear all the bullets on the canvas
  // partySetShared(bullets, {bullets: []});
 
  bullets = [];
}


function whoIsWinner() { // make the player who has the highest score become winner
  let highscore = 0;
  for(let p of participants) {
    if(p.score > highscore) highscore = p.score;
  }
  for(let p of participants) {
    if(p.score === highscore) p.isWin = true;
  }
}