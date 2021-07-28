// Set starting life totals here
var playerLife = 5;
var daemonLife = 5;

// Message when the game is over
var daemonWinnerMessage = "You have fallen...";
var playerWinnerMessage = "You have won!";
var outOfCardsTriggered = false;


// Game code starts here
var playerStartLife = parseInt(playerLife);
var daemonStartLife = parseInt(daemonLife);

var roundFinished = false;
var cardSelected = false;

updateScores();

document.querySelector(".game-board").classList.add("before-game");

var allCardElements = document.querySelectorAll(".card");

// Adds click handler to all player card elements
for(var i = 0; i < allCardElements.length; i++) {
  var card = allCardElements[i];
  if(card.classList.contains("player-card")) {
    card.addEventListener("click",function(e){
      cardClicked(this);
    });
  }
}


// When a card is clicked
function cardClicked(cardEl) {

  if(cardSelected) { return; }
  cardSelected = true;

  cardEl.classList.add("played-card");

  document.querySelector(".game-board").classList.add("card-selected");

  // Wait 500ms to reveal the daemon power
  setTimeout(function(){
    revealDaemonPower();
  },500)

  // Wait 750ms to reveal the player power
  setTimeout(function(){
    revealPlayerPower();
  },800)

  // Wait 1250ms to compare the card scoers
  setTimeout(function(){
    compareCards();
  }, 1400);
}

// Shows the power level on the player card
function revealPlayerPower(){
  var playerCard = document.querySelector(".played-card");
  playerCard.classList.add("reveal-power");
}

// Shows the power level on the daemon card
function revealDaemonPower(){
  var daemonCard = document.querySelector(".daemon-card");
  daemonCard.classList.add("reveal-power");
}

function parsePower(powerString){

  var suit = parseSuit(powerString);
  var rank = parseRank(powerString, suit);
  return { suit: suit, rank: rank};
}

function parsePowerDifference(playerPower, daemonPower) {
  
  // if suit is same, rootmost (lower card) wins
  if(playerPower.suit === daemonPower.suit){
    return daemonPower.rank - playerPower.rank;
  }

  // else: suits differ, highest card wins 

  return playerPower.rank - daemonPower.rank;
}

function parseSuit(powerString) {
  
  if(powerString.endsWith("D")){
    console.log("disks found");
    return "D";
  }

  if(powerString.endsWith("C")){
    console.log("cups found");
    return "C";
  }

  if(powerString.endsWith("S")){
    console.log("swords found");
    return "S";
  } 

  if(powerString.endsWith("W")){
    console.log("wands found");
    return "W";
  }

  return "ERROR PARSING SUIT";
}

function parseRank(powerString, suit) {
  return parseInt(powerString.replace(suit, ''));
}

function compareCards(){
  var playerCard = document.querySelector(".played-card");
  var playerPowerEl = playerCard.querySelector(".power");

  var daemonCard = document.querySelector(".daemon-card");
  var daemonPowerEl = daemonCard.querySelector(".power");

  var playerPower = parsePower(playerPowerEl.innerHTML);
  var daemonPower = parsePower(daemonPowerEl.innerHTML);

  var powerDifference = parsePowerDifference(playerPower, daemonPower);

  if (powerDifference < 0) {
    // Player Loses
    playerLife = playerLife + powerDifference;
    daemonCard.classList.add("better-card");
    playerCard.classList.add("worse-card");
    document.querySelector(".player-stats .thumbnail").classList.add("ouch");
  } else if (powerDifference > 0) {
    // Player Wins
    daemonLife = daemonLife - powerDifference;
    playerCard.classList.add("better-card");
    daemonCard.classList.add("worse-card");
    document.querySelector(".daemon-stats .thumbnail").classList.add("ouch");
  } else {
    playerCard.classList.add("tie-card");
    daemonCard.classList.add("tie-card");
  }

  updateScores();

  if(playerLife <= 0) {
    gameOver("Daemon");
  } else if (daemonLife <= 0){
    gameOver("Player")
  }

  roundFinished = true;

  document.querySelector("button.next-turn").removeAttribute("disabled");
}

function outOfCards() {
  
  outOfCardsTriggered = true;
  gameOver("Daemon");
}

// Shows the winner message
function gameOver(winner) {
  document.querySelector(".game-board").classList.add("game-over");
  document.querySelector(".winner-section").style.display = "flex";
  document.querySelector(".winner-section").classList.remove("player-color");
  document.querySelector(".winner-section").classList.remove("daemon-color");

  if(winner == "Daemon") {
    if(outOfCardsTriggered){
      daemonWinnerMessage = "Out of Cards! " + daemonWinnerMessage;
    }
    document.querySelector(".winner-message").innerHTML = daemonWinnerMessage;
    document.querySelector(".winner-section").classList.add("daemon-color");
  } else {
    document.querySelector(".winner-message").innerHTML = playerWinnerMessage;
    document.querySelector(".winner-section").classList.add("player-color");
  }
}


// Starts the game
function startGame() {
  document.querySelector(".game-board").classList.remove("before-game");
  document.querySelector(".game-board").classList.add("during-game");
  playTurn();
}


// Start the game over from scratch
function restartGame(){
  document.querySelector(".game-board").classList.remove("game-over");
  document.querySelector(".game-board").classList.remove("during-game");
  document.querySelector(".game-board").classList.add("before-game");

  document.querySelector(".winner-section").style.display = "none";
  document.querySelector(".daemon-card").style.display = "none";

  var cards = allCardElements;

  document.querySelector("button").removeAttribute("disabled");

  for(var i = 0; i < cards.length; i++) {
    cards[i].style.display = "none";
  }

  playerLife = playerStartLife;
  daemonLife = daemonStartLife;

  roundFinished = true;
  cardSelected = false;

  updateScores();
}

// Updates the displayed life bar and life totals
function updateScores(){

  // Update life totals for each player
  document.querySelector(".player-stats .life-total").innerHTML = playerLife;
  document.querySelector(".daemon-stats .life-total").innerHTML = daemonLife;

  // Update the player lifebar
  var playerPercent = playerLife / playerStartLife * 100;
  if (playerPercent < 0) {
    playerPercent = 0;
  }
  document.querySelector(".player-stats .life-left").style.height =  playerPercent + "%";

  // Update the daemon lifebar
  var daemonPercent = daemonLife / daemonStartLife * 100
  if (daemonPercent < 0) {
    daemonPercent = 0;
  }
  document.querySelector(".daemon-stats .life-left").style.height =  daemonPercent + "%";
}


// Shuffles an array
function shuffleArray(a) {
  var j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
  return a;
}


// Plays one turn of the game
function playTurn() {

  roundFinished = true;
  cardSelected = false;

  document.querySelector(".game-board").classList.remove("card-selected");

  // Remove "ouch" class from player and daemon thumbnails
  document.querySelector(".daemon-stats .thumbnail").classList.remove("ouch");
  document.querySelector(".player-stats .thumbnail").classList.remove("ouch");

  // Hides the "next turn" button, will show again when turn is over
  document.querySelector(".next-turn").setAttribute("disabled", "true");

  for(var i = 0; i < allCardElements.length; i++) {
    var card = allCardElements[i];
    card.classList.remove("showCard");
  }

  setTimeout(function(){
    revealCards();
  }, 500);
}

function revealCards(){

  if(scenarios.length == 0){
    
    outOfCards();
    return;
  }

  var j = 0;
  var cardIndexes = shuffleArray([0, 1, 2]);

  // Get scenario cards
  console.log("scenarios.length == " + scenarios.length);

  var randomScenarioIndex = Math.floor(Math.random() * scenarios.length);
  var scenario = scenarios[randomScenarioIndex];
  console.log(scenario.daemonCard.description);

  scenarios.splice(randomScenarioIndex, 1);

  console.log("scenarios.length after splice == " + scenarios.length);

  var daemonCard = scenario.daemonCard;
  var daemonCardEl = document.querySelector(".daemon-area .card");

  // Contents of the player cards
  var playerCards = scenario.playerCards;

  for(var i = 0; i < allCardElements.length; i++) {
    var card = allCardElements[i];

    card.classList.remove("worse-card");
    card.classList.remove("better-card");
    card.classList.remove("played-card");
    card.classList.remove("tie-card");
    card.classList.remove("prepared");
    card.classList.remove("reveal-power");

    // Display the payer card details
    if(card.classList.contains("player-card")) {
      card.querySelector(".text").innerHTML = playerCards[cardIndexes[j]].description;
      card.querySelector(".power").innerHTML = playerCards[cardIndexes[j]].power;
      j++;
    }

    // Reveal each card one by one with a delay of 100ms
    setTimeout(function(card, j){
      return function() {
        card.classList.remove("prepared");
        card.style.display = "block";
        card.classList.add("showCard");
      }
    }(card,i), parseInt(i+1) * 200);
  }

  // Display the daemon card
  daemonCardEl.querySelector(".text").innerHTML = daemonCard.description;
  daemonCardEl.querySelector(".power").innerHTML = daemonCard.power;
}
