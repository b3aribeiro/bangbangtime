function resetRoundTimer(){
  // initialize timer for a new round
 
  timer.roundCount += 1; // round +1

  timer.currentCountdown = ROUND_DURATION; //reset countdown to 10 seconds
  timer.roundFrame = 0; // reset the round frame

  timer.syncReady = false;
}

function syncFinishedTimer(){
  timer.syncReady = true;
}

function resetGameTimer(){
  // initialize timer for a new game
 
  timer.roundCount = 0; //reset round count to 0 

  timer.currentCountdown = ROUND_DURATION; 
  timer.roundFrame = 0; 

  timer.syncReady = false;

}

function updateTimer(){

    if(timer.currentCountdown < 0) {//if this round time's up 

        if (timer.roundCount < ROUND_TOTAL) //check if game's over 
          startRound();

        else
          endGame();

      }else{
    
        //if not time's up, keep running the countdown
        if(timer.roundFrame % FRAME_RATE === 0) timer.currentCountdown -= 1; 
        timer.roundFrame ++; // add frame count
  
      }

}

function drawTimer(){
      //display timer and rounds 
      push()
      fill(0)
      rect(0,580,width*2, 50)
      fill(255)
      textSize(20);
      textAlign(CENTER);
      text( `Current Round ${timer.roundCount}/${ROUND_TOTAL}`, 100, 570);
      
      text( `${my.score}`, 500, 570);
      text( `${timer.currentCountdown}`, 300, 570);
      textFont('Helvetica');
      text( "🕰️", 320, 575);
      text( `✶`, 520, 573);
      pop()
}