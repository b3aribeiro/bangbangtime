
function resetGameTimer(){
  // initialize timer for a new game
 
  timer.roundCount = 0; //reset round count to 0 
  timer.currentCountdown = ROUND_DURATION; 
  timer.roundFrame = 0; 

  timer.roundState = 'start';  
  //values can be: start, inbetween

  timer.resetLocalPlayerFinished = false;

 
}

function resetRoundTimer(){
  // initialize timer for a new round
 
  timer.roundCount += 1; // round +1

  timer.currentCountdown = ROUND_DURATION; //reset countdown to 10 seconds
  timer.roundFrame = 0; // reset the round frame

  timer.roundState = 'start';  

}


function updateTimer(){
//called by the host on every frame during game play

    if(timer.currentCountdown < 0) {//if this round time's up 

        if (timer.roundCount < ROUND_TOTAL){  //check if game's over 

          if (timer.roundState == 'start'){

            timer.roundState = 'inbetween';
            timer.resetLocalPlayerFinished = false;

            my.receiveScore = ifHasStar() ? true : false; //check if has score this round

          } 
                
        } else{
          endGame();
        }

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