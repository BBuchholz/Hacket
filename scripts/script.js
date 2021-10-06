const myriad = require('@entomdt/myriad-core');
const magisterLudi = myriad.KnechtController();

// Set starting life totals here
var heatIndex = 0;
var moistureIndex = 0;
var fireCaptures = 0;
var waterCaptures = 0;
var airCaptures = 0;
var earthCaptures = 0;
var fireCaptureSequence = "9W/3C, 8W/5D";
var waterCaptureSequence = "7C/4W, 9C/3S";
var airCaptureSequence = "6S/5D, 7S/4C";
var earthCaptureSequence = "5D/2S, 4D/2W";


// Message when the game is over
var daemonWinnerMessage = "You have fallen...";
var playerWinnerMessage = "You have won!";
var fireCaptureMessage = "fire quadrant";
var airCaptureMessage = "air quadrant";
var waterCaptureMessage = "water quadrant";
var earthCaptureMessage = "earth quadrant";
var outOfCardsTriggered = false;


// Game code starts here
var heatIndexStart = parseInt(heatIndex);
var moistureIndexStart = parseInt(moistureIndex);

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

function getHDeltaFromSuit(suit) {
    
      switch (suit) {      

        case 'D':
          // console.log("disks found");
          return -1;
       
        case 'C':
          // console.log("cups found");
          return -1;
       
        case 'S':
          // console.log("swords found");
          return 1;
        
        case 'W':
          // console.log("wands found");
          return 1;
        
        default:
          return 0;
      }
    }

    function getMDeltaFromSuit(suit) {
      
      switch (suit) {      

        case 'D':
          // console.log("disks found");
          return -1;
       
        case 'C':
          // console.log("cups found");
          return 1;
       
        case 'S':
          // console.log("swords found");
          return 1;
        
        case 'W':
          // console.log("wands found");
          return -1;
        
        default:
          return 0;
      }
    }

function parseResult(playerPower, daemonPower) {

  // NB: heatDelta and moistureDelta for future usage
  var playResult = {
    powerDifference: 0,
    heatDelta: 0,
    moistureDelta: 0,
  }

  var trumpSuit = '?';
  
  if(playerPower.suit === daemonPower.suit){
  
    // if suit is same, rootmost (lower card) wins
    
    playResult.powerDifference = daemonPower.rank - playerPower.rank;
    trumpSuit = (daemonPower.rank < playerPower.rank) ? daemonPower.suit : playerPower.suit; 
  
  } else {

    // suits differ, highest card wins 

    playResult.powerDifference = playerPower.rank - daemonPower.rank;
    trumpSuit = (daemonPower.rank > playerPower.rank) ? daemonPower.suit : playerPower.suit;
  }

  playResult.heatDelta = getHDeltaFromSuit(trumpSuit);
  playResult.moistureDelta = getMDeltaFromSuit(trumpSuit);

  console.log(playResult);

  return playResult;
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

  var playResult = parseResult(playerPower, daemonPower);

  if (playResult.powerDifference < 0) {
    // Player Loses
    
    var pDiff = Math.abs(playResult.powerDifference);
    var mDelta = pDiff * playResult.moistureDelta;
    var hDelta = pDiff * playResult.heatDelta;
    moistureIndex = moistureIndex + mDelta;
    heatIndex = heatIndex + hDelta;
    
    //heatIndex = heatIndex + playResult.powerDifference;
    daemonCard.classList.add("better-card");
    playerCard.classList.add("worse-card");
    document.querySelector(".player-stats .thumbnail").classList.add("ouch");
  } else if (playResult.powerDifference > 0) {
    // Player Wins

    var pDiff = Math.abs(playResult.powerDifference);
    var mDelta = pDiff * playResult.moistureDelta;
    var hDelta = pDiff * playResult.heatDelta;
    moistureIndex = moistureIndex + mDelta;
    heatIndex = heatIndex + hDelta;

    //moistureIndex = moistureIndex - playResult.powerDifference;
    playerCard.classList.add("better-card");
    daemonCard.classList.add("worse-card");
    document.querySelector(".daemon-stats .thumbnail").classList.add("ouch");
  } else {
    playerCard.classList.add("tie-card");
    daemonCard.classList.add("tie-card");
  }

  updateScores();

  processCaptures();

  roundFinished = true;

  document.querySelector("button.next-turn").removeAttribute("disabled");
}

function processCaptures() {

  if(outOfCardsTriggered){
    gameOver('Daemon');
    return;
  }

  if(heatIndex > 0 && moistureIndex > 0){
    capture('Air');
  }

  if(heatIndex < 0 && moistureIndex < 0){
    capture('Earth');
  }

  if(heatIndex > 0 && moistureIndex < 0){
    capture('Fire');
  }

  if(heatIndex < 0 && moistureIndex > 0){
    capture('Water');
  }
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
  
  switch (winner) {

    case 'Daemon':
      if(outOfCardsTriggered){
        daemonWinnerMessage = 'Out of cards! ' + daemonWinnerMessage;
      }
      document.querySelector(".winner-message").innerHTML = daemonWinnerMessage;
      document.querySelector(".winner-section").classList.add("daemon-color");  
      break;
    
    default:

      document.querySelector(".winner-message").innerHTML = playerWinnerMessage;
      document.querySelector(".winner-section").classList.add("player-color");  
      break;
  }
}

function calculateCaptureTotals(includeSequences){

  let outputMessage = "";

  if(includeSequences){

    outputMessage += earthCaptures + "E [" + earthCaptureSequence + "]\n";
    outputMessage += waterCaptures + "W  [" + waterCaptureSequence + "]\n";
    outputMessage += airCaptures + "A  [" + airCaptureSequence + "]\n";
    outputMessage += fireCaptures + "F [" + fireCaptureSequence + "]\n";

  } else {

    outputMessage += earthCaptures + "E ";
    outputMessage += waterCaptures + "W  ";
    outputMessage += airCaptures + "A  ";
    outputMessage += fireCaptures + "F ";
    
  }

  return outputMessage;
}

function showStats() {
  alert(calculateCaptureTotals(true));
}

function capture(element) {
  
  switch (element) {

    case 'Earth':

      earthCaptures += 1;
      
      document.querySelector(".h-index-name").innerHTML = "COLD";
      document.querySelector(".m-index-name").innerHTML = "DRY";
      document.querySelector(".next-turn").innerHTML = earthCaptureMessage + " " + calculateCaptureTotals(false);
      document.querySelector(".next-turn").classList.add("earth-color");  
      break;
    
    case 'Fire':
    
      fireCaptures += 1;

      document.querySelector(".h-index-name").innerHTML = "HOT";
      document.querySelector(".m-index-name").innerHTML = "DRY";
      document.querySelector(".next-turn").innerHTML = fireCaptureMessage + " " + calculateCaptureTotals(false);
      document.querySelector(".next-turn").classList.add("fire-color");  
      break;
    
    case 'Air':
    
      airCaptures += 1;

      document.querySelector(".h-index-name").innerHTML = "HOT";
      document.querySelector(".m-index-name").innerHTML = "WET";
      document.querySelector(".next-turn").innerHTML = airCaptureMessage + " " + calculateCaptureTotals(false);
      document.querySelector(".next-turn").classList.add("air-color");  
      break;
    
    case 'Water':
    
      waterCaptures += 1;

      document.querySelector(".h-index-name").innerHTML = "COLD";
      document.querySelector(".m-index-name").innerHTML = "WET";
      document.querySelector(".next-turn").innerHTML = waterCaptureMessage + " " + calculateCaptureTotals(false);
      document.querySelector(".next-turn").classList.add("water-color");  
      break;
    
    default:

      // do nothing
      break;
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

  roundFinished = true;
  cardSelected = false;

  resetAristoleanIndexes();
  updateScores();
}

// Updates the displayed life bar and life totals
function updateScores(){

  // Update life totals for each player
  document.querySelector(".player-stats .life-total").innerHTML = heatIndex;
  document.querySelector(".daemon-stats .life-total").innerHTML = moistureIndex;

  // Update the player lifebar
  var playerPercent = heatIndex / heatIndexStart * 100;
  if (playerPercent < 0) {
    playerPercent = 0;
  }
  document.querySelector(".player-stats .life-left").style.height =  playerPercent + "%";

  // Update the daemon lifebar
  var daemonPercent = moistureIndex / moistureIndexStart * 100
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

  //resetAristoleanIndexes();
  updateScores();

  for(var i = 0; i < allCardElements.length; i++) {
    var card = allCardElements[i];
    card.classList.remove("showCard");
  }

  setTimeout(function(){
    revealCards();
  }, 500);
}


function resetAristoleanIndexes(){

  heatIndex = heatIndexStart;
  moistureIndex = moistureIndexStart;
}

function getImgSrcFromPowerString(powerString){
  return '/images/' + powerString + '.jpg';
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
      var imgSrc = getImgSrcFromPowerString(playerCards[cardIndexes[j]].power);
      card.querySelector(".image").src = imgSrc;
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
  var imgSrc = getImgSrcFromPowerString(daemonCard.power);
  daemonCardEl.querySelector(".image").src = imgSrc;
  daemonCardEl.querySelector(".power").innerHTML = daemonCard.power;
}
