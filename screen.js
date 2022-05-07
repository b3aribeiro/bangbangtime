function drawStartScreen(){
    if(partyIsHost()){
        push()
        textSize(30);
        text('Take control of your city, Sherif!', width / 2, height / 2);
        text('Press ENTER to defend it.', width / 2, height / 2 + 30);
        pop()

      }else{
        push()
        textSize(20);
        text('The Sherif looking for a bandit like you...', width / 2, height / 2);
        text('Get ready to show who should control this town', width / 2, height / 2 + 30);
        pop()
      }
}


function drawEndScreen(){
  //display win/lose result
  if(partyIsHost()){
    whoIsWinner();
  }
  
  for(let p of participants) {
    if (p.role == "player1" && p.isWin == true) image(ASSETS_MANAGER.get("win_red"), 0, 0);
    else if (p.role == "player1" && p.isWin == false) image(ASSETS_MANAGER.get("win_blue"), 0, 0);

    if (p.role == "player2" && p.isWin == true) image(ASSETS_MANAGER.get("win_blue"), 0, 0);
    else if (p.role == "player2" && p.isWin == true) image(ASSETS_MANAGER.get("win_red"), 0, 0);
  }

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

  for(let p of participants) {
    if(p.score > highscore) highscore = p.score;
  }

  for(let p of participants) {
    if(p.score == highscore) p.isWin = true;
  }
}

function whoIsRoundWinner(){

  for(let p of participants) {
    p.receiveScore = ifHasBadge(p) ? true : false; //check if has score this round
  }
}