var context = canvas.getContext("2d");
var shape = new Object();
var board;
var score;
var lives;
var pac_color;
var time_remained;
var delay;
var clockWasEaten = false;
var interval;
var rewardInterval;
var ghostsInterval;
var usersMap = new Map();
usersMap.set('a',"a");
var lastDirection;
var reward;
var ghost1;
var ghost2;
var ghost3;
var numOfColums = 20;
var numOfRows = 10;
var errors = false;

var food_remain;
var totalBalls;

var numOfBall_5;
var numOfBall_15;
var numOfBall_25;

var foodArr = new Array();
var medicine = {x:-1, y:-1};
var clock = {x:-1, y:-1};
var lastRewardPos = -1;

//IMAGES
var rewardImg = new Image();
rewardImg.src = 'images/lollipop.png';
var ghost1Img = new Image();
ghost1Img.src = 'images/blueGhost.png';
var ghost2Img = new Image();
ghost2Img.src = 'images/redGhost.png';
var ghost3Img = new Image();
ghost3Img.src = 'images/yellowGhost.png';
var medicineImg = new Image();
medicineImg.src = 'images/heart2.png';
var clockImg = new Image();
clockImg.src = 'images/clock.png';
var wallImg = new Image();
wallImg.src = 'images/wallBlue.jpg';

//SOUNDS
var gameAudio = new Audio('sounds/game.mp3');
gameAudio.loop = true;
var fruitAudio = new Audio('sounds/Fruit.mp3');
var crashAudio = new Audio('sounds/crash.mp3');
var victoryAudio = new Audio('sounds/victory.mp3');
var lossAudio = new Audio('sounds/gameOver.mp3');


//SETTINGS
var keyUp = 'ArrowUp';
var keyDown = 'ArrowDown';
var keyLeft = 'ArrowLeft';
var keyRight = 'ArrowRight';
var numOfBalls;
var color5P;
var color15p;
var color25P;
var gameTime;
var totalDuration;
var numOfMonsters;
var validSettings;


function Start() {
    board = new Array();
    score = 0;
    lives = 3;
    if (clockWasEaten){
        totalDuration = totalDuration - 10;
        clockWasEaten = false;
    }
    delay = 0;
    time_remained = totalDuration;
    pac_color = "#fff000";
    lastDirection = 0;
    var cnt = numOfColums*numOfRows;
    var pacman_remain = 1;
    food_remain = numOfBalls;
    totalBalls = numOfBalls;
    end_time = new Date();
    end_time.setSeconds(end_time.getSeconds() + totalDuration);
    reward = {x:0, y:0};
    ghost1 = {x:19, y:9};
    ghost2 = {x:0, y:9};
    ghost3 = {x:19, y:0};

    setNumOfFoodBalls();

    for(i = 0; i < 6; i++){ //initialize food array
        foodArr[i] = -1;
    }
    for (var i = 0; i < numOfColums; i++) {
        board[i] = new Array();
        for (var j = 0; j < numOfRows; j++) {
            //initialize reward position
            if (i == reward.x && j == reward.y){
                board[i][j] = 5;
            }
            //initalize ghosts positions
            if((i === ghost1.x && j === ghost1.y) ||
             (i === ghost2.x && j === ghost2.y && numOfMonsters > 1) ||
              (i === ghost3.x && j === ghost3.y && numOfMonsters > 2)){
                if (i === ghost1.x && j === ghost1.y){
                    board[i][j] = 6;
                }
                if (i === ghost2.x && j === ghost2.y && numOfMonsters > 1){
                    board[i][j] = 7;
                }
                if (i === ghost3.x && j === ghost3.y && numOfMonsters > 2){
                    board[i][j] = 8;
                }
            }
            //initalize walls
            else if ((i === 14 && j === 5) || (i === 14 && j === 6) ||  (i === 14 && j === 4) ||  (i === 15 && j === 4) ||  (i === 16 && j === 4) || (i === 3 && j === 3) || (i === 3 && j === 4) || (i === 3 && j === 5) || (i === 2 && j === 5)|| (i === 6 && j === 1) || (i === 18 && j === 7) || (i === 18 && j === 8) ||
             (i === 6 && j === 2) || (i === 7 && j === 2) || (i === 8 && j === 2) || (i === 9 && j === 2) || (i === 4 && j === 8) || (i === 5 && j === 8) || (i === 6 && j === 8) || (i === 7 && j === 8) || (i === 8 && j === 5) || (i === 9 && j === 5)) {
                board[i][j] = 4;
            //initialize balls (without classification by colors)
            } else {
                var randomNum = Math.random();
                if (randomNum <= 1.0 * food_remain / cnt) {
                    food_remain--;
                    board[i][j] = 1;
                } else {
                    board[i][j] = 0;
                }
                cnt--;
            }
        }
    }
    //initialize pacman position
    placePacmanRandomly();
    pacman_remain--;
    
    //initialize the rest of total balls (if remained)
    while (food_remain > 0) {
        var emptyCell = findRandomEmptyCell(board);
        board[emptyCell[0]][emptyCell[1]] = 1;
        food_remain--;
    }

    classifyBallsByColors();
    setNumOfFoodBalls();

    //initialize medicne position
    var emptyCell = findRandomEmptyCell(board);
    board[emptyCell[0]][emptyCell[1]] = 9;
    medicine.x = emptyCell[0];
    medicine.y = emptyCell[1];

    //initialize clock position
    var emptyCell = findRandomEmptyCell(board);
    board[emptyCell[0]][emptyCell[1]] = 10;
    clock.x = emptyCell[0];
    clock.y = emptyCell[1];    

    keysDown = {};
    addEventListener("keydown", function (e) {
        keysDown[e.code] = true;
    }, false);
    addEventListener("keyup", function (e) {
        keysDown[e.code] = false;
    }, false);
    interval = setInterval(UpdatePosition, 120);

    rewardInterval = setInterval(updateRewardPosition, 500);

    ghostsInterval = setInterval(moveGhosts, 450);
}

function classifyBallsByColors (){
    var randBallType;
    var ballsAmount;
    var ballColor;    

    colorsBoard = new Array();
    for (i = 0; i < numOfColums; i++){
        colorsBoard[i] = new Array();
        for (j = 0; j < numOfRows; j++){
            if (board[i][j] == 1) { //is a food cell
                randBallType = getRandomBallType();
                if (randBallType == 0){
                    ballsAmount = numOfBall_5;
                    ballColor = color5P;
                }
                else if (randBallType == 1){
                    ballsAmount = numOfBall_15;
                    ballColor = color15P;
                }
                else if (randBallType == 2){
                    ballsAmount = numOfBall_25;
                    ballColor = color25P;
                }

                //check if there were remained balls of that type
                while(ballsAmount == 0 && (numOfBall_5 + numOfBall_15 + numOfBall_25 > 0)){
                    randBallType = getRandomBallType();
                    if (randBallType == 0){
                        ballsAmount = numOfBall_5;
                        ballColor = color5P;
                    }
                    else if (randBallType == 1){
                        ballsAmount = numOfBall_15;
                        ballColor = color15P;
                    }
                    else if (randBallType == 2){
                        ballsAmount = numOfBall_25;
                        ballColor = color25P;
                    }
                }
                colorsBoard[i][j] = ballColor;
                if(ballsAmount == numOfBall_5){
                    numOfBall_5--;                        
                }
                else if(ballsAmount == numOfBall_15){
                    numOfBall_15--;                        
                }
                else if(ballsAmount == numOfBall_25){
                    numOfBall_25--;                        
                }  
            }
            else{
                colorsBoard[i][j] = -1;
            }              
        }
    }
}

function newGame() {
    clearAllIntervals();
    numOfBalls = totalBalls;
    Start();
    showWindow('game');
    gameAudio.load();
    gameAudio.play();
}

function placePacmanRandomly(){
    var emptyCell = findRandomEmptyCell(board);
    board[emptyCell[0]][emptyCell[1]] = 2;
    shape.i = emptyCell[0];
    shape.j = emptyCell[1];
}

function getRandomBallType() {
    return Math.floor((Math.random() * 3));
}

function findRandomEmptyCell(board) {
    var i = Math.floor((Math.random() * numOfColums-1) + 1);
    var j = Math.floor((Math.random() * numOfRows-1) + 1);
    while (board[i][j] !== 0) {
        i = Math.floor((Math.random() * numOfColums-1) + 1);
        j = Math.floor((Math.random() * numOfRows-1) + 1);
    }
    return [i, j];
}

/**
 * @return {number}
 */
function GetKeyPressed() {
    if (keysDown[keyUp]) {
        return 1;
    }
    if (keysDown[keyDown]) {
        return 2;
    }
    if (keysDown[keyLeft]) {
        return 3;
    }
    if (keysDown[keyRight]) {
        return 4;
    }
}

function Draw(direction) {
    if (direction === 0){ 
        if (lastDirection !== 0){
            direction = lastDirection;
        }
    }
    context.clearRect(0, 0, canvas.width, canvas.height); //clean board
    lblScore.value = score;
    lblTime.value = time_remained;
;   lblLife.value = lives;
    for (var i = 0; i < numOfColums; i++) {
        for (var j = 0; j < numOfRows; j++) {
            var center = new Object();
            center.x = i * 60 + 30;
            center.y = j * 60 + 30;
            /* draw pacman */
            if (board[i][j] === 2) {
                context.beginPath();
                if (direction === 0) { //no key pressed
                    context.arc(center.x, center.y, 30, 0.15 * Math.PI, 1.85 * Math.PI);
                }
                else if (direction === 1) { //up
                    context.arc(center.x, center.y, 30, 1.65 * Math.PI, 1.35 * Math.PI);
                }
                else if (direction === 2) { //down
                    context.arc(center.x, center.y, 30, 0.65 * Math.PI, 0.35 * Math.PI);
                }
                else if (direction === 3) { //left
                    context.arc(center.x, center.y, 30, 1.15 * Math.PI, 0.85 * Math.PI);
                }
                else if (direction === 4) { //right
                    context.arc(center.x, center.y, 30, 0.15 * Math.PI, 1.85 * Math.PI);
                }
                context.lineTo(center.x, center.y);
                context.fillStyle = pac_color; //color of pacman
                context.fill();
                context.beginPath();
                lastDirection = direction;
                // set the eye of the pacman according to the direction
                if (direction === 1 || direction === 2) { //up or down
                    context.arc(center.x + 12, center.y - 5, 5, 0, 2 * Math.PI); // circle
                }
                else { //left or right
                    context.arc(center.x + 5, center.y - 15, 5, 0, 2 * Math.PI); // circle
                }
                context.fillStyle = "black"; //pacman's eye color
                context.fill();
            /* draw food balls */
            } else if (board[i][j] === 1) {
                context.beginPath();
                if (colorsBoard[i][j] == color5P){
                    context.arc(center.x, center.y, 10, 0, 2 * Math.PI); // circle
                }
                else if (colorsBoard[i][j] == color15P){
                    context.arc(center.x, center.y, 13, 0, 2 * Math.PI); // circle
                }
                else if (colorsBoard[i][j] == color25P){
                    context.arc(center.x, center.y, 16, 0, 2 * Math.PI); // circle
                }
                context.fillStyle = colorsBoard[i][j]; //color of food ball
                context.fill();
            /* draw walls */
            } else if (board[i][j] === 4) {
                context.drawImage(wallImg, center.x - 30, center.y - 30, 60, 60);

                // context.beginPath();
                // context.rect(center.x - 30, center.y - 30, 60, 60);
                // context.fillStyle = "MidnightBlue"; //color of wall
                // context.fill();

            /* draw reward */
            } else if (board[i][j] === 5) {
                context.drawImage(rewardImg, 60 * reward.x, 60 * reward.y, 60, 60);
            }
            /* draw ghosts */
            else if (board[i][j] === 6) {
                context.drawImage(ghost1Img, 60 * ghost1.x, 60 * ghost1.y, 60, 60);
            }
            else if (board[i][j] === 7) {
                context.drawImage(ghost2Img, 60 * ghost2.x, 60 * ghost2.y, 60, 60);
            }
            else if (board[i][j] === 8) {
                context.drawImage(ghost3Img, 60 * ghost3.x, 60 * ghost3.y, 60, 60);
            }
            /* draw medicine */
            else if(board[i][j]==9)
            {
                context.drawImage(medicineImg, 60 * medicine.x, 60 * medicine.y, 55, 55);
            }
            /* draw clock */
            else if(board[i][j]==10)
            {
                context.drawImage(clockImg, 60 * clock.x, 60 * clock.y, 60, 60);
            }
            
           
        }
    }
}

function UpdatePosition() {

    if (numOfBalls <= 0) {
        clearAllIntervals();
        gameAudio.pause();
        victoryAudio.play();
        window.alert("Game completed");
        return;
    }


    board[shape.i][shape.j] = 0;
    var x = GetKeyPressed();


    //up
     if (x === 1) {
        if (shape.j > 0 && board[shape.i][shape.j - 1] !== 4) {
            shape.j--;
        }
    }
    //down
    else if (x === 2) {
        if (shape.j < 9 && board[shape.i][shape.j + 1] !== 4) {
            shape.j++;
        }
    }
    //right
    else if (x === 3) {
        if (shape.i > 0 && board[shape.i - 1][shape.j] !== 4) {
            shape.i--;
        }
    }
    //left
    else if (x === 4) {
        if (shape.i < 19 && board[shape.i + 1][shape.j] !== 4) {
            shape.i++;
        }
    }
    //no movement
    else {
        x = 0;
    }




    /* pacman ate food ball */
    if (board[shape.i][shape.j] === 1) {
        //check which kind of ball the pacman ate
        var color = colorsBoard[shape.i][shape.j];   
        if (color == color5P) {
            score += 5;
        }
        else if (color == color15P){
            score += 15;
        }
        else if (color == color25P){
            score += 25;
        }
        numOfBalls--;
    }

    /* pacman ate reward - gets bonus */
    if (shape.i == reward.x && shape.j == reward.y) {
        fruitAudio.play();
        score += 50;
        reward.x = -1;
        reward.y = -1;
        board[shape.i][shape.j] = 2;

    }

    /* pacman ate medicine - gets one more life */
    if (shape.i == medicine.x && shape.j == medicine.y) {
        fruitAudio.play();
        lives++;
        medicine.x = -1;
        medicine.y = -1;
        board[shape.i][shape.j] = 9;
    }

    /* pacman ate clock - gets more time for game */
    if (shape.i == clock.x && shape.j == clock.y) {
        fruitAudio.play();
        totalDuration += 10;
        end_time.setSeconds(end_time.getSeconds() + 10);
        clockWasEaten = true;
        clock.x = -1;
        clock.y = -1;
        board[shape.i][shape.j] = 10;
    }

    board[shape.i][shape.j] = 2;
    var currentTime = new Date();
    time_remained = ((end_time - currentTime) / 1000) + delay;

    if (time_remained <= 10 && lives == 1)  {
        pac_color = "green";
    }
    

    /* ---End Of The Game--- */
    if (time_remained < 0){
        gameAudio.pause();
        if (score < 150){
            clearAllIntervals();
            window.alert("You can do better, you gained only " + score + " points");
        }
        else{
            victoryAudio.play();
            clearAllIntervals();
            window.alert("We have a Winner!!!");
        }
    }

    else {
        Draw(x);
    }
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

  function LoadWindow() {

    if ((screen.width<1920) && (screen.height<1080)) 
        {
            var body=document.getElementById("body");
            body.style.zoom="67.5%";
        }
    else
        {
             var body=document.getElementById("body");
            body.style.zoom="100%";
        }
        hideAllWindows();
        showWindow('welcome');
}

function showWindow(id){
    if (id != "game"){
        clearAllIntervals();
       gameAudio.pause();
    }
    hideAllWindows();
    if (id != "settings"){
        clearSettingsErrors();
    }
    if (errors){
        clearErrors();
        clearInputs();
    }
    $("#"+id).show();

}

function hideAllWindows(){
    $("#welcome").hide();
    $("#register").hide();
    $("#login").hide();
    $("#settings").hide();
    $("#about").hide();
    $("#game").hide();
}

function clearAllIntervals() {
    window.clearInterval(interval);
    window.clearInterval(rewardInterval);
    window.clearInterval(ghostsInterval);
}

function loginValidation(){
    let username=document.getElementById('loginUsername').value;
    let password=document.getElementById('loginPsw').value;

    if(!username){
        alert("Please enter your username");
    }

    else if(!password){
        alert("Please enter your password");
    }

    else{
        if (!usersMap.has(username)){
            alert("Invalid username");
        }
        else{
            if(password!==usersMap.get(username)){
                alert("Incorrect password"); 
            }
            else{
                lblUsername.value = username;
                clearSettings();
                clearSettingsErrors();
                showWindow('settings');
            }
        }
    }

    document.getElementById('loginUsername').value="";
    document.getElementById('loginPsw').value="";
}

function about(){
    clearAllIntervals();
    clearSettingsErrors();
    $("#about").show();


    // Get the modal
var modal = document.getElementById('myModal');


// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal 
modal.style.display = "block";

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

$(document).keydown(function(event) { 
    if (event.keyCode == 27) { 
        modal.style.display = "none";
        }
  });
}

function setUpKey(event){
    var inputVal = event;
    keyUp = event.code;
    document.getElementById('upKey').value=inputVal.key;
}

function setDownKey(event){
    var inputVal = event;
    keyDown = event.code;
    document.getElementById('downKey').value=inputVal.key;
}

function setLeftKey(event){
    var inputVal = event;
    keyLeft = event.code;
    document.getElementById('leftKey').value=inputVal.key;
}

function setRightKey(event){
    var inputVal = event;
    keyRight = event.code;
    document.getElementById('rightKey').value=inputVal.key;
}


function updateRewardPosition() {

    if((reward.x == -1 && reward.y == -1)) { // pacman already ate the reward
        return;
    }

    var col = reward.x;
    var row = reward.y;
    var updated = false;

    if (lastRewardPos == 1){
        board[col][row] = 1;
    }
    else if (lastRewardPos == 9){
        board[col][row] = 9;
    }
    else if (lastRewardPos == 10){
        board[col][row] = 10;
    }

    while (!updated){
        var randDirection = getRandDirection();
        //move up
        if(randDirection == 1){
            if (isValidMove (col, row - 1)) {
                reward.y = row - 1; //update reward position
                updated = true;
            }
            
        }
        //move down
        else if(randDirection == 2){
            if (isValidMove (col, row + 1)) {
                reward.y = row + 1; //update reward position
                updated = true;
            }
        }
        //move right
        else if(randDirection == 3){
            if (isValidMove (col + 1, row)) {
                reward.x = col + 1; //update reward position
                updated = true;
            }
        }
        //move left
        else if(randDirection == 4){
            if (isValidMove (col - 1, row)) {
                reward.x = col - 1; //update reward position
                updated = true;
            }
        }
    }
    lastRewardPos = board[reward.x][reward.y];
    board[reward.x][reward.y] = 5;
    if (board[col][row] != 1 && board[col][row] != 9 && board[col][row] != 10) {
        board[col][row] = 0; //free cell
    }
}

function isValidMove(col,row) {
    if (col > numOfColums - 1 || col < 0 || row > numOfRows - 1 || row < 0 ){
        return false;
    }
    if(board[col][row] == 2 || board[col][row] == 4 || board[col][row] == 6 || board[col][row] == 7 || board[col][row] == 8)  // add ghosts
        return false;
    return true;
}

function getRandDirection(){
    return Math.floor((Math.random() * 3) + 1);
}



function moveGhosts(){
    if (numOfMonsters == 1){
        updateGhostPosition(ghost1);
    }
    else if (numOfMonsters == 2){
        updateGhostPosition(ghost1);
        updateGhostPosition(ghost2);

    }
    else if (numOfMonsters == 3){
        updateGhostPosition(ghost1);
        updateGhostPosition(ghost2);
        updateGhostPosition(ghost3);

    }

}

//return ghost idx in the food array
function getGhostIdx(ghost) {
    if (Object.is(ghost,ghost1)){
        return 0;
    }
    if (Object.is(ghost,ghost2)){
        return 1;
    }
    if (Object.is(ghost,ghost3)){
        return 2;
    }
}

function updateGhostPosition(ghost){

    var col = ghost.x;
    var row = ghost.y;

    var ghostIdx = getGhostIdx(ghost); // idx 0 for ghost1, idx 1 for ghost2 and idx 2 for ghost3
    if (foodArr[ghostIdx] != -1 && foodArr[ghostIdx + 3] != -1) {
        board[foodArr[ghostIdx]][foodArr[ghostIdx + 3]] = 1;
        foodArr[ghostIdx] = -1;
        foodArr[ghostIdx + 3] = -1;
    }


    var direction = getGhostDirection(col, row);
    //move up
    if(direction == 1){
            ghost.y = row - 1; //update ghost position
    }
    //move down
    else if(direction == 2){
            ghost.y = row + 1; //update ghost position
    }
    //move right
    else if(direction == 3){
            ghost.x = col + 1; //update ghost position
    }
    //move left
    else if(direction == 4){
            ghost.x = col - 1; //update ghost position
    }

    if (direction != -1){
        if (board[ghost.x][ghost.y] == 1) { //ghost moves to food cell
            foodArr[ghostIdx] = ghost.x;
            foodArr[ghostIdx + 3] = ghost.y;
        }  
        board[ghost.x][ghost.y] = ghostIdx + 6; // ghost1 is 6, ghost2 is 7, ghost3 is 8
        if (board[col][row] != 1){
            board[col][row] = 0; //free cell
        }
    }

    /* ghost ate pacman - losts one life */
    if (ghost.x == shape.i && ghost.y == shape.j) {
        score -= 10;
        lives--;

        if (lives == 0){            
            lblLife.value = 0;
            lblScore.value = score;
            gameAudio.pause();
            lossAudio.play();        
            clearAllIntervals();
            window.alert("You Lost!");
        }
        else{
            sleep(1000);
            crashAudio.play();
            sleep(1000);
            delay += 2;
            ghost1 = {x:19, y:9};
            ghost2 = {x:0, y:9};
            ghost3 = {x:19, y:0};
            placePacmanRandomly();
       }
    }
}

function getGhostDirection(col, row){
    var distances = [Infinity, Infinity, Infinity, Infinity];
    var isValidUp = isValidGhostMove(col,row - 1);
    var isValidDown = isValidGhostMove(col,row + 1);
    var isValidLeft = isValidGhostMove(col - 1,row);
    var isValidRight = isValidGhostMove(col + 1,row);
    var minDistance;
    var minIndex;
    if (isValidUp){
        distances[0] = calcDistance([shape.i,shape.j],[col,row - 1]);
    }
    if (isValidDown){
        distances[1] = calcDistance([shape.i,shape.j],[col,row + 1]);
    }
    if (isValidRight){
        distances[2] = calcDistance([shape.i,shape.j],[col + 1,row]);
    }
    if (isValidLeft){
        distances[3] = calcDistance([shape.i,shape.j],[col - 1,row]);
    }
    minDistance = distances[0];
    minIndex = 1;
    for (var i = 1; i < distances.length; i++){
        
        if (distances[i] < minDistance){
            minDistance = distances[i];
            minIndex = i + 1;
        }
    }


    if (minDistance !== Infinity){
        return minIndex;
    }
    else{
        return -1;
    }
}

function calcDistance([col1,row1],[col2,row2]){
    return Math.sqrt(Math.pow(Math.abs(col2 - col1),2) + Math.pow(Math.abs(row2 - row1),2));
}

function isValidGhostMove(col,row){
    if (col > numOfColums - 1 || col < 0 || row > numOfRows - 1 || row < 0 ){
        return false;
    }
    if(board[col][row] == 4 || board[col][row] == 5 || board[col][row] == 6 || board[col][row] == 7 || board[col][row] == 8 || board[col][row] == 9 || board[col][row] == 10){
        return false;
    }
    return true;
}

function clearSettings(){
    document.getElementById('upKey').value = "";
    document.getElementById('downKey').value = "";
    document.getElementById('leftKey').value = "";
    document.getElementById('rightKey').value = "";
    document.getElementById('numOfBalls').value = "";
    document.getElementById('color5P').value = "";
    document.getElementById('color15P').value = "";
    document.getElementById('color25P').value = "";
    document.getElementById('gameDuration').value = "";
    document.getElementById('numOfMonsters').value = "";

    keyUp = "";
    keyDown = "";
    keyLeft = "";
    keyRight = "";
    numOfBalls = "";
    color5P = "";
    color15p = "";
    color25P = "";
    gameTime = "";
    numOfMonsters = "";
}

function clearSettingsErrors(){
    document.getElementById("errorMsgUpKey").innerHTML = "";
    document.getElementById("errorMsgDownKey").innerHTML = "";
    document.getElementById("errorMsgLeftKey").innerHTML = "";
    document.getElementById("errorMsgRightKey").innerHTML = "";
    document.getElementById("errorMsgNumOfBalls").innerHTML = "";
    document.getElementById("errorMsgColors").innerHTML = "";
    document.getElementById("errorMsgGameDuration").innerHTML = "";
    document.getElementById("errorMsgNumOfMonsters").innerHTML = "";
}

function setGameSettings() {
    if (!lblUsername.value){
        window.alert("You should login in order to define game settings.If you dont have an account sign up via register")
    }
    else{
        validSettings = settingsValidation();
        if (validSettings){    
            //set number of balls
            numOfBalls = document.getElementById('numOfBalls').value;
    
            //set balls colors
            color5P = document.getElementById('color5P').value;
            color15P = document.getElementById('color15P').value;
            color25P = document.getElementById('color25P').value;
    
            //set game duration
            gameTime = document.getElementById('gameDuration').value;
            totalDuration = parseInt(gameTime);
    
            //set number of monsters
            numOfMonsters = document.getElementById('numOfMonsters').value;
    
            window.alert("Your settings were saved. Be ready to play!");
        }
        else{
            window.alert("Could not save settings.Press OK to see errors.")
        }
    }

}

function setNumOfFoodBalls() {
    numOfBall_5 = Math.floor(0.6 * numOfBalls);
    numOfBall_15 = Math.floor(0.3 * numOfBalls);
    numOfBall_25 = numOfBalls - numOfBall_15 - numOfBall_5; //the rest from the total num of balls (~10%)
}

function setRandomGameSettings(){
      //set keys
      keyUp = 'ArrowUp';
      keyDown = 'ArrowDown';
      keyLeft = 'ArrowLeft';
      keyRight = 'ArrowRight';

      //set number of balls
      numOfBalls = Math.floor(Math.random() * 40) + 50;

      //set balls colors
      color5P = randomColor();
      color15P = randomColor();
      color25P = randomColor();

      //set game duration
      gameTime = Math.floor(Math.random() * 840) + 60;
      totalDuration = gameTime;
      gameTime = "" + totalDuration;

      //set number of monsters
      numOfMonsters = Math.floor(Math.random() * 3) + 1;

      showRandomGameSettings();
}

function showRandomGameSettings(){
    //show keys
    document.getElementById('upKey').value = keyUp;
    document.getElementById('downKey').value = keyDown;
    document.getElementById('leftKey').value = keyLeft;
    document.getElementById('rightKey').value = keyRight;

    //show number of balls
    document.getElementById('numOfBalls').value = numOfBalls;
    
    
    //show balls colors
    document.getElementById('color5P').value = color5P;
    document.getElementById('color15P').value = color15P;
    document.getElementById('color25P').value = color25P;

    //show game duration
    document.getElementById('gameDuration').value = gameTime;

    //show number of monsters
    document.getElementById('numOfMonsters').value = numOfMonsters;
    clearSettingsErrors();
}

function settingsValidation(){
    var valid = true;
    //validate keys
    if (!document.getElementById('upKey').value){
        document.getElementById("errorMsgUpKey").innerHTML = "please press a requested key";
        valid = false;
    }
    else{
        document.getElementById("errorMsgUpKey").innerHTML = "";
    }
    if (!document.getElementById('downKey').value){
        document.getElementById("errorMsgDownKey").innerHTML = "please press a requested key";
        valid = false;
    }
    else{
        document.getElementById("errorMsgDownKey").innerHTML = "";
    }
    if (!document.getElementById('leftKey').value){
        document.getElementById("errorMsgLeftKey").innerHTML = "please press a requested key";
        valid = false;
    }
    else{
        document.getElementById("errorMsgLeftKey").innerHTML = "";
    }
    if (!document.getElementById('rightKey').value){
        document.getElementById("errorMsgRightKey").innerHTML = "please press a requested key";
        valid = false;
    }
    else{
        document.getElementById("errorMsgRightKey").innerHTML = "";
    }

    //validate number of balls
    if (!document.getElementById('numOfBalls').value){
        document.getElementById("errorMsgNumOfBalls").innerHTML = "please choose a value (a number between 50 to 90)"
        valid = false;
    }
    else if(document.getElementById('numOfBalls').value < 50 || document.getElementById('numOfBalls').value > 90){
        document.getElementById("errorMsgNumOfBalls").innerHTML = "value should be a number between 50 to 90";
        valid = false;
    }
    else{
        document.getElementById("errorMsgNumOfBalls").innerHTML = "";
    }

    //validate balls colors
    if (document.getElementById('color5P').value === document.getElementById('color15P').value || 
    document.getElementById('color5P').value === document.getElementById('color25P').value || 
    document.getElementById('color15P').value === document.getElementById('color25P').value){
    document.getElementById("errorMsgColors").innerHTML = "please choose a different color for each kind of ball";
    valid = false;
    }
    else{
        document.getElementById("errorMsgColors").innerHTML = "";
    }

    //validate game duration
    if (!document.getElementById('gameDuration').value){
        document.getElementById("errorMsgGameDuration").innerHTML = "please choose a value (minimum 60 sec)"
        valid = false;
    }
    else if (document.getElementById('gameDuration').value < 60){
        document.getElementById("errorMsgGameDuration").innerHTML = "value should be a number greater or equal to 60 sec"
        valid = false;
    }
    else{
        document.getElementById("errorMsgGameDuration").innerHTML = "";
    }

    //validate number of monsters
    if(!document.getElementById('numOfMonsters').value){
        document.getElementById("errorMsgNumOfMonsters").innerHTML = "please choose a value (a number between 1 to 3)"
        valid = false;
    }
    else if(document.getElementById('numOfMonsters').value < 1 || document.getElementById('numOfMonsters').value > 3){
        document.getElementById("errorMsgNumOfMonsters").innerHTML = "value should be a number between 1 to 3"
        valid = false;
    }
    else{
        document.getElementById("errorMsgNumOfMonsters").innerHTML = "";
    }

    return valid;
}

function getRandomColor(){
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function playGame(){
    if (!lblUsername.value){
        window.alert("You should login in order to play.If you dont have an account sign up via register");
        return;
    }
    validSettings = settingsValidation();
    if (validSettings){
        setGameSettings();
        clearAllIntervals();
        numOfBalls = document.getElementById('numOfBalls').value;
        Start();
        sleep(1000);
        showWindow('game');
        gameAudio.load();
        gameAudio.play();
    }
    else{
        window.alert("You should either set game settings or fix errors above in order to be able to play")
    }
}
jQuery(function($) {	
	$("form#register_form input[name='submit']").click(function() {
        
        var errorFound = false;

		var username 		= $("form#register_form input[name='username']").val();
		var fname 			= $("form#register_form input[name='fname']").val();
		var lname 			= $("form#register_form input[name='lname']").val();
		var name_regex 		= /^[a-zA-Z]+$/;
		var email 			= $("form#register_form input[name='email']").val();
		var email_regex 	= /^[\w%_\-.\d]+@[\w.\-]+.[A-Za-z]{2,6}$/;
		var password 		= $("form#register_form input[name='password']").val();
		var pass_regex 		= /^[a-zA-Z0-9]+$/;
		var repassword 		= $("form#register_form input[name='repassword']").val();
		var birthdate 		= $("form#register_form input[name='birthDate']").val();

		
		/* check username */	
		if(username == "") {
			$("span.val_username").html("This field is required.").addClass('validate');
			errorFound = true;
		} else {
			if(usersMap.has(username)){
				$("span.val_username").html("This username already exists").addClass('validate');
				errorFound = true;
			} else {
			$("span.val_username").html("");
			}
		}

		/* check password */
		if(password == "") {
			$("span.val_pass").html("This field is required.").addClass('validate');
			errorFound = true;
		} else {
			if (password.length < 8) {
				$("span.val_pass").html("Password must be at least 8 characters.").addClass('validate');
				errorFound = true;
			} else if(!pass_regex.test(password)){
				$("span.val_pass").html("Password should contain only letters and digits.").addClass('validate');
				errorFound = true;
			} else {
                    $("span.val_pass").html("");
			}
		} 
		/* check repeat password */
		if(repassword == "") {
			$("span.val_repass").html("This field is required.").addClass('validate');
			errorFound = true;
		} else {
			if(password != repassword) {
				$("span.val_repass").html("Password does not match!").addClass('validate');
				errorFound = true;
			} else {
				$("span.val_repass").html("");
			}
		}
		/* check first name */
		if(fname == "") {
			$("span.val_fname").html("This field is required.").addClass('validate');
			errorFound = true;
		} else if(!name_regex.test(fname)){
			$("span.val_fname").html("First Name must contain only letters.").addClass('validate');
			errorFound = true;
		} else {
			$("span.val_fname").html("");
		}
		/* check last name */
		if(lname == "") {
			$("span.val_lname").html("This field is required.").addClass('validate');
			errorFound = true;
		} else if(!name_regex.test(lname)){
			$("span.val_lname").html("Last Name must contain only letters.").addClass('validate');
			errorFound = true;
		} else {
			$("span.val_lname").html("");
			}
		/* check email */
		if(email == "") {
			$("span.val_email").html("This field is required.").addClass('validate');
			errorFound = true;
		} else {
			if(!email_regex.test(email)){
				$("span.val_email").html("Invalid Email!").addClass('validate');
				errorFound = true;
			} else {
				$("span.val_email").html("");
			}
		}
		/* check birthdate */
		if(birthdate == "") {
			$("span.val_birthdate").html("This field is required.").addClass('validate');
			errorFound = true;
		} else {
			$("span.val_birthdate").html("");
		}

		//if errors were found
		if(errorFound) {
            errors = true;
			return false;
		}
		// registration is valid - go to Login window
		else{
            errors = false;
            errorFound = false;
            usersMap.set(username,password);
            clearInputs();
			showWindow('login');
        }
	});
});

function clearInputs() {
    var divObjects = document.getElementById('register_form');
    var inputs = divObjects.getElementsByTagName('input');
    for (i = 0; i < inputs.length; i++) {
        if (inputs[i].name != 'submit'){
            inputs[i].value = "";
        }
    }
}

function clearErrors() {
    $("span.val_username").html("");
    $("span.val_pass").html("");
    $("span.val_repass").html("");
    $("span.val_fname").html("");
    $("span.val_lname").html("");
    $("span.val_email").html("");
    $("span.val_birthdate").html("");
}