function drawStartScreen(){
    if(partyIsHost()) {
      push()
      textSize(30);
      text('Take control of your city, Sherif!', width / 2, height / 2);
      text('Press ENTER to defend it.', width / 2, height / 2 + 30);
      pop()
    } else if(my.role !== "observer") {
      push()
      textSize(20);
      text('The Sherif looking for a bandit like you...', width / 2, height / 2);
      text('Get ready to show who should control this town', width / 2, height / 2 + 30);
      pop()
    } else {
      push()
      textSize(20);
      text('The room is already full', width / 2, height / 2);
      text('Please wait for the next round', width / 2, height / 2 + 30);
      pop()
    }
}


function drawEndScreen(){
  //display win/lose result
  if(partyIsHost()){
    whoIsWinner();
  }
  

  if (my.role == "player1" && my.isWin == true) image(ASSETS_MANAGER.get("win_red"), 0, 0);
  else if (my.role == "player1" && my.isWin == false) image(ASSETS_MANAGER.get("win_blue"), 0, 0);
  else if (my.role == "player1" && my.isWin == "even") image(ASSETS_MANAGER.get("stunned1"), 0, 0); //use even score img instead

  
  if (my.role == "player2" && my.isWin == false) image(ASSETS_MANAGER.get("win_red"), 0, 0);
  else if (my.role == "player2" && my.isWin == true) image(ASSETS_MANAGER.get("win_blue"), 0, 0);
  else if (my.role == "player2" && my.isWin == "even") image(ASSETS_MANAGER.get("stunned1"), 0, 0); //use even score img instead


  //instructions to restart the game
  if(partyIsHost()){
      push()
      fill(0)
      textSize(20);
      textAlign(CENTER);
      text('Press ENTER to Restart', width / 2, height - 200);
      pop()
      // console.log("LMK When it kits !shared with party host - game end")
  }
}

function drawInBetweenScreen(){

  if (partyIsHost()){
    whoIsRoundWinner();
  }
  //display result of last round
  let result = my.receiveScore ? 'You got it!' : 'Try again!';
  push()
  fill(0)
  textSize(30);
  textAlign(CENTER);
  text(`${result}`, width / 2, height / 2 - 100);

  textSize(20);
  text(`current score: ${my.score}`, width / 2, height / 2 - 50);

  text(`${timer.inbetweenCountdown}`, width / 2, height / 2);
  pop()

  //instructions to restart the game


}

function whoIsWinner() { // make the player who has the highest score become winner
  let highscore = 0;
  let isFirstWinner = true;
  let even = false;

  //determine winning score
  for(let p of participants) {
    if(p.score > highscore) highscore = p.score;
  }

  //assgin winner
  for(let p of participants) {
    if (p.score == highscore){

      if (isFirstWinner){

        p.isWin = true;
        isFirstWinner = false;

      } else {
        even = true;
      }
    }
  
  }

  if (even){
    for(let p of participants) {
      p.isWin = "even"
    }
  }


}

function whoIsRoundWinner(){

  for(let p of participants) {
    p.receiveScore = ifHasBadge(p) ? true : false; //check if has score this round
  }
}