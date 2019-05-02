var context = canvas.getContext("2d");
var shape = new Object();
var board;
var score;
var lives;
var pac_color;
var start_time;
var time_elapsed;
var interval;
var rewardInterval;
var usersMap = new Map();
usersMap.set('a',"a");
var lastDirection;
var reward = {x:0, y:0};
var numOfColums = 20;
var numOfRows = 10;

var numOfBall_5;
var numOfBall_15;
var numOfBall_25;


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

hideAllWindows();
showWindow('welcome');
Start();

function Start() {
    board = new Array();
    score = 0;
    lives = 3;
    //time_elapsed = 0;
    pac_color = "yellow";
    lastDirection = 0;
    var cnt = numOfColums*numOfRows;
    var pacman_remain = 1;
    start_time = new Date();
    for (var i = 0; i < numOfColums; i++) {
        board[i] = new Array();
        for (var j = 0; j < numOfRows; j++) {
            //initialize reward position
            if (i == reward.x && j == reward.y){
                board[i][j] = 5;
            }
            //initalize walls
            else if ((i === 0 && j === 2) || (i === 0 && j === 3) || (i === 3 && j === 3) || (i === 3 && j === 4) || (i === 3 && j === 5) || (i === 6 && j === 1) || (i === 19 && j === 7) ||
             (i === 6 && j === 2) || (i === 4 && j === 8) || (i === 5 && j === 8) || (i === 6 && j === 8) || (i === 7 && j === 8) || (i === 8 && j === 5) || (i === 9 && j === 5)) {
                board[i][j] = 4;
            //initialize balls (without classification by colors)
            } else {
                var randomNum = Math.random();
                if (randomNum <= 1.0 * numOfBalls / cnt) {
                    numOfBalls--;
                    board[i][j] = 1;
                } else {
                    board[i][j] = 0;
                }
                cnt--;
            }
        }
    }
    //initialize pacman position
    var emptyCell = findRandomEmptyCell(board);
        board[emptyCell[0]][emptyCell[1]] = 2;
        shape.i = emptyCell[0];
        shape.j = emptyCell[1];
        pacman_remain--;
    
    //initialize the rest of total balls (if remained)
    while (numOfBalls > 0) {
        var emptyCell = findRandomEmptyCell(board);
        board[emptyCell[0]][emptyCell[1]] = 1;
        numOfBalls--;
    }

    classifyBallsByColors();

    keysDown = {};
    addEventListener("keydown", function (e) {
        keysDown[e.code] = true;
    }, false);
    addEventListener("keyup", function (e) {
        keysDown[e.code] = false;
    }, false);
    interval = setInterval(UpdatePosition, 120);

    rewardInterval = setInterval(updateRewardPosition, 500);
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
                if (randBallType == 'ball_5'){
                    ballsAmount = numOfBall_5;
                    ballColor = color5P;
                }
                else if (randBallType == 'ball_15'){
                    ballsAmount = numOfBall_15;
                    ballColor = color15P;
                }
                else if (randBallType == 'ball_25'){
                    ballsAmount = numOfBall_25;
                    ballColor = color25P;
                }
                //check if there were remain balls of that type
                if (ballsAmount > 0) {
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
            }
        }
    }
}

function getRandomBallType() {
    var rand = Math.floor((Math.random() * 2) + 1);
    switch (rand) {
        case 0:
            return 'ball_5';
        case 1:
            return 'ball_15';
        case 2:
            return 'ball_25';   
    }
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
    lblTime.value = time_elapsed;
    lblLife.value = lives;
    for (var i = 0; i < numOfColums; i++) {
        for (var j = 0; j < numOfRows; j++) {
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
                context.arc(center.x, center.y, 10, 0, 2 * Math.PI); // circle
                context.fillStyle = colorsBoard[i][j]; //color
                context.fill();
            } else if (board[i][j] === 4) {
                context.beginPath();
                context.rect(center.x - 30, center.y - 30, 60, 60);
                context.fillStyle = "grey"; //color
                context.fill();
            } else if (board[i][j] === 5) {
                drawReward();
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
    /* pacman ate food ball */
    if (board[shape.i][shape.j] === 1) {
        //check which kind of ball the pacman ate
        var color = colorsBoard[i][j];   
        if (color == color5P) {
            score += 5;
        }
        else if (color == color15P){
            score += 15;
        }
        else if (color == color25P){
            score += 25;
        }
        score++;
    }

    /* pacman ate reward - gets bonus */
    if (shape.i == reward.x && shape.j == reward.y) {
        score += 50;
        reward.x = -1;
        reward.y = -1;
        board[shape.i][shape.j] = 2;
    }

    board[shape.i][shape.j] = 2;
    var currentTime = new Date();
    time_elapsed = (currentTime - start_time) / 1000;
    if (score >= 20 && time_elapsed <= 10) {
        pac_color = "green";
    }

    /* ---End Of The Game--- */
    // if (numOfBalls === 0) {
    //     clearAllIntervals();
    //     window.alert("Game completed");
    // }

    // if (time_elapsed >= gameTime){
    //     if (score < 150){
    //         clearAllIntervals();
    //         window.alert("You can do better");
    //     }
    //     else{
    //         clearAllIntervals();
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
    // window.clearInterval(interval);
    // window.clearInterval(rewardInterval);
}

function clearAllIntervals() {
    window.clearInterval(interval);
    window.clearInterval(rewardInterval);
   // window.clearInterval(GhostInterval);
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

function drawReward () {
    var rewardImg = new Image();
    rewardImg.src = 'images/lollipop2.png';
    context.drawImage(rewardImg, 60 * reward.x, 60 * reward.y, 60, 60);
}

function updateRewardPosition() {

    if((reward.x == -1 && reward.y == -1)) { // pacman already ate the reward
        return;
    }

    var col = reward.x;
    var row = reward.y;
    var randDirection = getRandDirection();
    //move up
    if(randDirection == 1){
        if (isValidMove (col, row - 1)) {
            reward.y = row - 1; //update reward position
        }
    }
    //move down
    else if(randDirection == 2){
        if (isValidMove (col, row + 1)) {
            reward.y = row + 1; //update reward position
        }
    }
    //move right
    else if(randDirection == 3){
        if (isValidMove (col + 1, row)) {
            reward.x = col + 1; //update reward position
        }
    }
    //move left
    else if(randDirection == 4){
        if (isValidMove (col - 1, row)) {
            reward.x = col - 1; //update reward position
        }
    }
    board[reward.x][reward.y] = 5; 
    board[col][row] = 0; //free cell
}

function isValidMove(col,row) {
    if (col > numOfColums - 1 || col < 0 || row > numOfRows - 1 || row < 0 ){
        return false;
    }
    // if(board[col][row] == 2 || board[col][row] == 3 || board[col][row] == 4)  // add ghosts
    //     return false;
    return true;
}

function getRandDirection(){
    return Math.floor((Math.random() * 3) + 1);
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

}

function setNumOfFoodBalls() {
    numOfBall_5 = 0.6 * numOfBalls;
    numOfBall_15 = 0.3 * numOfBalls;
    numOfBall_25 = numOfBalls - numOfBall_15 - numOfBall_25; //the rest from the total num of balls (~10%)
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
        window.alert("You should login in order to play.If you dont have an account sign up via register")
    }
    else if (validSettings){
        showWindow('game');
    }
    else{
        window.alert("You should either press save settings, set game settings or fix errors above in order to be able to play")
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
			$("p.validate_msg").slideDown("fast");
			return false;
		}
		// registration is valid - go to Login window
		else{
            errorFound = false;
            usersMap.set(username,password);
            console.log(usersMap);
            clearInputs();
			showWindow('login');
		}
	});
});

function clearInputs() {
    var divObjects = document.getElementById('register_form');
    var inputs = divObjects.getElementsByTagName('input');
    for (i = 0; i < inputs.length; i++) {
        inputs[i].value = "";
    }
}