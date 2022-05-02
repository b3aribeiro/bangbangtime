let screen = 0;

function  menuScreen(){
    imageMode(CENTER);
    rectMode(CORNER);
    switch(screen){
        case 0: //main menu
        image(ASSETS_MANAGER.get("screen_menu"), SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
            break;
        case 1: //tutorial 1
        image(ASSETS_MANAGER.get("tutorial_1"), SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
            break;
        case 2: //tutorial 2
        image(ASSETS_MANAGER.get("tutorial_2"), SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
            break;
        case 3: //tutorial 3
        image(ASSETS_MANAGER.get("tutorial_3"), SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
            break;
        case 4: //tutorial 4
        image(ASSETS_MANAGER.get("tutorial_4"), SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
            break;
        case 5: //credits
        image(ASSETS_MANAGER.get("credits"), SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
            break;
        case 6: //credits
        image(ASSETS_MANAGER.get("screen_menu"), SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
            break;
    }
}

function  titleScreen(){
    image(ASSETS_MANAGER.get("screen_logo"), 0, 0);
}

function  roomScreen(){
    if (room == null) image(ASSETS_MANAGER.get("screen_room"), 50, 150);
}

function mouseClicked(){
    if(screen == 0){
        if (mouseX >= 210 && mouseX <= 352 && mouseY >= 175 && mouseY <= 352){
            gameState = "PLAYING";
        } else if (mouseX >= 519 && mouseX <= 660 && mouseY >= 177 && mouseY <= 365){
            screen++;
        } else if (mouseX >= 355 && mouseX <= 507 && mouseY >= 392 && mouseY <= 559){
            screen = 5;
        }
    } else if(screen >= 1 || screen <= 3){
        if(mouseX > SCREEN_WIDTH/2){
            screen++;
        } else{
            screen--;
        }
    } else if (screen == 4){
        if(mouseX > SCREEN_WIDTH/2){
            screen = 0;
            screen = 0;
        } else{
            screen--;
        }
    } else if (screen == 5){ 
        if(mouseX > 0 || mouseX < SCREEN_WIDTH) screen = 0;
    }

    if(screen > 5) screen = 0;
}
