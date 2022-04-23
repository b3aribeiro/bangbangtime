function drawStartScreen(){
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
}


function drawEndScreen(){
    //display win/lose result
    let result = my.isWin ? 'win!' : 'lose!';
    push()
    fill(0)
    textSize(30);
    textAlign(CENTER);
    text(`You ${result}`, 300, 200);
    pop()

    //instructions to restart the game
    if(partyIsHost()){
        push()
        fill(0)
        textSize(20);
        textAlign(CENTER);
        text('Take control of your city, Sherif!', 300, 300);
        text('Press ENTER to defend it.', 300, 330);
        pop()
        // console.log("LMK When it kits !shared with party host - game end")
      }else{
        push()
        fill(0)
        textSize(20);
        textAlign(CENTER);
        text('The Sherif looking for a bandit like you...', 300, 300);
        text('Get ready to show who should control this town', 300, 320);
        pop()
        // console.log("LMK When it kits !shared with party host - game end")
      }
}