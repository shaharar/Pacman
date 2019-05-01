var context = canvas.getContext("2d");
var shape = new Object();
var board;
var score;
var lives;
var pac_color;
var start_time;
var time_elapsed;
var interval;
var usersMap = new Map();
usersMap.set('a',"a");
var lastDirection;
var reward = {x:0, y:0};


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
var numOfMonsters;
var validSettings;


Start();

function Start() {
    hideAllWindows();
    showWindow('welcome');
    board = new Array();
    score = 0;
    lives = 3;
    pac_color = "yellow";
    lastDirection = 0;
    var cnt = 100;
    var food_remain = 50;
    var pacman_remain = 1;
    start_time = new Date();
    for (var i = 0; i < 10; i++) {
        board[i] = new Array();
        //put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
        for (var j = 0; j < 10; j++) {
            if ((i === 0 && j === 2) || (i === 0 && j === 3) || (i === 3 && j === 3) || (i === 3 && j === 4) || (i === 3 && j === 5) || (i === 6 && j === 1) ||
             (i === 6 && j === 2) || (i === 4 && j === 8) || (i === 5 && j === 8) || (i === 6 && j === 8) || (i === 7 && j === 8) || (i === 8 && j === 5) || (i === 9 && j === 5)) {
                board[i][j] = 4;
            } else {
                var randomNum = Math.random();
                if (randomNum <= 1.0 * food_remain / cnt) {
                    food_remain--;
                    board[i][j] = 1;
                } else if (randomNum < 1.0 * (pacman_remain + food_remain) / cnt) {
                    shape.i = i;
                    shape.j = j;
                    pacman_remain--;
                    board[i][j] = 2;
                } else {
                    board[i][j] = 0;
                }
                cnt--;
            }
        }
    }
    board[0][0] = 5; //start position of reward
    while (food_remain > 0) {
        var emptyCell = findRandomEmptyCell(board);
        board[emptyCell[0]][emptyCell[1]] = 1;
        food_remain--;
    }
    keysDown = {};
    addEventListener("keydown", function (e) {
        keysDown[e.code] = true;
    }, false);
    addEventListener("keyup", function (e) {
        keysDown[e.code] = false;
    }, false);
    interval = setInterval(UpdatePosition, 250);
}


function findRandomEmptyCell(board) {
    var i = Math.floor((Math.random() * 9) + 1);
    var j = Math.floor((Math.random() * 9) + 1);
    while (board[i][j] !== 0) {
        i = Math.floor((Math.random() * 9) + 1);
        j = Math.floor((Math.random() * 9) + 1);
    }
    return [i, j];
}

/**
 * @return {number}
 */
function GetKeyPressed() {
    if (keysDown[keyUp.code]) {
        return 1;
    }
    if (keysDown[keyDown.code]) {
        return 2;
    }
    if (keysDown[keyLeft.code]) {
        return 3;
    }
    if (keysDown[keyRight.code]) {
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
    lblTime.value = time_elapsed;
    lblLife.value = lives;
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            var center = new Object();
            center.x = i * 60 + 30;
            center.y = j * 60 + 30;
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
                context.fillStyle = pac_color; //color
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
                context.fillStyle = "black"; //color
                context.fill();
            } else if (board[i][j] === 1) {
                context.beginPath();
                context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
                context.fillStyle = "black"; //color
                context.fill();
            } else if (board[i][j] === 4) {
                context.beginPath();
                context.rect(center.x - 30, center.y - 30, 60, 60);
                context.fillStyle = "grey"; //color
                context.fill();
            } else if (board[i][j] === 5) {
                drawReward();
                updateRewardPosition();
            }
        }
    }
}

function UpdatePosition() {
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
        if (shape.i < 9 && board[shape.i + 1][shape.j] !== 4) {
            shape.i++;
        }
    }
    //no movement
    else {
        x = 0;
    }
    if (board[shape.i][shape.j] === 1) {
        //check which kind of ball the pacman ate
        // if (){
        //     score += 5;
        // }
        // else if (){
        //     score += 15;
        // }
        // else if (){
        //     score += 25;
        // }
        score++;
    }
    board[shape.i][shape.j] = 2;
    //board[reward.x][reward.y] = 5;
    var currentTime = new Date();
    time_elapsed = (currentTime - start_time) / 1000;
    if (score >= 20 && time_elapsed <= 10) {
        pac_color = "green";
    }
    if (score === 50) {
        window.clearInterval(interval);
        window.alert("Game completed");
    }
    // if (time_elapsed === gameTime){
    //     if (score < 150){
    //         window.clearInterval(interval);
    //         window.alert("You can do better");
    //     }
    //     else{
    //         window.clearInterval(interval);
    //         window.alert("We have a Winner!!!");
    //     }
    // }
    else {
        Draw(x);
    }
}


function showWindow(id){
    if (id !== "about"){
        hideAllWindows();
    }
    else{
        about();
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
                showWindow('settings');
            }
        }
    }

    document.getElementById('loginUsername').value="";
    document.getElementById('loginPsw').value="";
}

function about(){
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
    keyUp = event;
    document.getElementById('upKey').value=inputVal.key;
}

function setDownKey(event){
    var inputVal = event;
    keyDown = event;
    document.getElementById('downKey').value=inputVal.key;
}

function setLeftKey(event){
    var inputVal = event;
    keyLeft = event;
    document.getElementById('leftKey').value=inputVal.key;
}

function setRightKey(event){
    var inputVal = event;
    keyRight = event;
    document.getElementById('rightKey').value=inputVal.key;
}

function drawReward () {
    context.beginPath();
    context.rect(reward.x, reward.y, 60, 60);
    context.fillStyle = "pink"; //color
    context.fill();
}

function updateRewardPosition() {
    var emptyCell = findRandomEmptyCell(board);
    reward.x = emptyCell[0];
    reward.y = emptyCell[1];
  //  board[reward.x][reward.y] = 5;
}

function setGameSettings() {
    validSettings = settingsValidation();
    if (validSettings){
        //set keys
        // keyUp = document.getElementById('upKey').value;
        // keyDown = document.getElementById('downKey').value;
        // keyLeft = document.getElementById('leftKey').value;
        // keyRight = document.getElementById('rightKey').value;

        //set number of balls
        numOfBalls = document.getElementById('numOfBalls').value;

        //set balls colors
        color5P = document.getElementById('color5P').value;
        color15P = document.getElementById('color15P').value;
        color25P = document.getElementById('color25P').value;

        //set game duration
        gameTime = document.getElementById('gameDuration').value;

        //set number of monsters
        numOfMonsters = document.getElementById('numOfMonsters').value;

        window.alert("Your settings were saved.Press PLAY to start game");
    }
    else{
        window.alert("Could not save settings.Press OK to see errors.")
    }
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

      //set number of monsters
      numOfMonsters = Math.floor(Math.random() * 2) + 1;

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
    settingsValidation();
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
    if (validSettings){
        showWindow('game');
    }
    else{
        window.alert("You should either set game settings or fix errors above in order to be able to play")
    }
}
