//This js file will be deleted once we organize its contents

function drawGame(){
    background(220);
  
    if(shared.isRunning) {
      updateGameObjects();
      updateGameVisual();
    }
    
    if (!shared.isRunning) {
      if(timer.roundCount === 0) {
        if(partyIsHost()){
          push()
          textSize(30);
          text('Take control of your city, Sherif!', 300, 300);
          text('Press ENTER to defend it.', 300, 330);
          pop()
  
        }else{
          push()
          textSize(20);
          text('The Sherif looking for a bandit like you...', 300, 300);
          text('Get ready to show who should control this town', 300, 320);
          pop()
        }
      } else { // game end, display winner
        let result = my.isWin ? 'win!' : 'lose!';
        push()
        fill(0)
        textSize(16);
        textAlign(CENTER);
        text(`You ${result}`, 300, 300);
        pop()
        if(partyIsHost()){
          push()
          fill(0)
          textSize(16);
          textAlign(CENTER);
          text(`you are the host, press ENTER to start the game`, 300, 350);
          pop()
          // console.log("LMK When it kits !shared with party host - game end")
        }else{
          push()
          fill(0)
          textSize(16);
          textAlign(CENTER);
          text(`wait for the host to start the game`, 300, 350);
          pop()
          // console.log("LMK When it kits !shared with party host - game end")
        }
      }
    } else {
      
    // console.log("else what?")
    // console.log(shared.isRunning)
      //display timer and rounds 
      push()
      fill(0)
      rect(0,580,width*2, 50)
      fill(255)
      textSize(20);
      textAlign(CENTER);
      text( `Current Round ${timer.roundCount}/${ROUND_TOTAL}`, 100, 570);
      
      text( `${my.score}`, 500, 570);
      text( `${timer.count}`, 300, 570);
      textFont('Helvetica');
      text( "🕰️", 320, 575);
      text( `✶`, 520, 573);
      pop()
      
      if(partyIsHost()){ // update countdown
  
        if(timer.roundFrame % FRAME_RATE === 0) timer.count -= 1; // countdown
        timer.roundFrame ++; // add frame count
  
        if(timer.count <= -1) {
          if (timer.roundCount < ROUND_TOTAL)
            startRound();
          else
            endGame();
        }
      }
    } // end timer
  }