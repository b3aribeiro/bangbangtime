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
    let result = my.isWin ? 'win!' : 'lose!';
    push()
    fill(0)
    textSize(30);
    textAlign(CENTER);
    text(`You ${result}`, width / 2, height / 2 - 100);

    textSize(20);
    text(`score: ${my.score}`, width / 2, height / 2 - 50);
    pop()

    //instructions to restart the game
    if(partyIsHost()){
        push()
        fill(0)
        textSize(20);
        textAlign(CENTER);
        text('Take control of your city, Sherif!', width / 2, height / 2);
        text('Press ENTER to defend it.', width / 2, height / 2 + 30);
        pop()
        // console.log("LMK When it kits !shared with party host - game end")
      }else{
        push()
        fill(0)
        textSize(20);
        textAlign(CENTER);
        text('The Sherif looking for a bandit like you...', width / 2, height / 2);
        text('Get ready to show who should control this town', width / 2, height / 2 + 20);
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