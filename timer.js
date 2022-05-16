
function resetGameTimer(){
  // initialize timer for a new game
 
  timer.roundCount = 0; //reset round count to 0 
  timer.roundCountdown = ROUND_DURATION; 
  timer.roundFrame = 0; 

  timer.roundState = 'start';  
  //values can be: start, inbetween

  timer.inbetweenCountdown = INBETWEEN_DURATION;
  timer.inbetweenFrame = 0;

  timer.resetLocalPlayerFinished = false;
 
}

function resetRoundTimer(){
  // initialize timer for a new round
 
  timer.roundCount += 1; // round +1

  timer.roundCountdown = ROUND_DURATION; //reset countdown to 10 seconds
  timer.roundFrame = 0; // reset the round frame

  timer.roundState = 'start';  

}


function updateTimer(){
//called by the host on every frame during game play

    if(timer.roundCountdown < 0) {//if this round time's up 

        if (timer.roundCount < ROUND_TOTAL){  //check if game's over 

          endRound();
                
        } else{
          endGame();
        }

      }else{
    
        //if not time's up, keep running the countdown
        if(timer.roundFrame % FRAME_RATE === 0) timer.roundCountdown -= 1; 
        timer.roundFrame ++; // add frame count
  
      }

}


function updateInbetweenTimer(){

    if(timer.inbetweenCountdown < 0){

        startRound();
      
      }else{
            
        //if not time's up, keep running the countdown
        if(timer.inbetweenFrame % FRAME_RATE === 0) timer.inbetweenCountdown -= 1; 
        timer.inbetweenFrame ++; // add frame count
        
      }
}

function drawTimer(){
      //display timer and rounds 
      push()
      //translate(0, SITE.bottom - 580)
      //translate(400, 20)
      // fill(0)
      // rect(0,580,width*2, 50)
      fill(255)
      textSize(20);
      textAlign(CENTER);
      text( `Current Round ${timer.roundCount}/${ROUND_TOTAL}`, 100, 20);
      
      text( `${my.score}`, 500, 20);
      text( `${timer.roundCountdown}`, 300, 20);
      textFont('Helvetica');
      text( "🕰️", 320, 25);
      text( `✶`, 520, 23);
      pop()
}