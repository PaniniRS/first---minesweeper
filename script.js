"use strict";

/*
#TODO: 

  #ONLOAD:
  HIDE THE GAME
    1. Create a modal that asks for the difficulty
    2. After that start and show the game

  #GAMEOVER:
    1. show a different modal for winning and losing abd add a button to restart the game(opens the resetgamemodal)

    #EXTRA:
    6.Create a difficulty selector
      6.1. Maybe add custom user defined parameters for bombs and field size
    7.Create custom themes
    8.Create a highscore system
    
*/

let mineCount = 10;
let flagCount = 10;
let time = 0;
let mineDiscovered = 0;
let interval;
let size = 10;
let mineFieldSizeX = size;
let mineFieldSizeY = size;
let mineFieldMatrix = [];

// or hard = 75% of the field mines | medium = 50% of the field mines | easy = 25% of the field mines
//20 x 20  max    | hard = 99 mines | medium = 40 mines | easy = 10 mines
//10 x 10  medium | hard = 40 mines | medium = 20 mines | easy = 5 mines
//8  x 8   small  | hard = 20 mines | medium = 10 mines | easy = 5 mines

const appendGameContainer = document.querySelector(".container");
const appendMineCount = document.getElementById("count-mine");
const appendTimerCount = document.getElementById("count-timer");
const appendResetModal = document.querySelector(".modalResetGame");
const appendBgBlur = document.querySelector(".bgBlur");
const appendClose = document.querySelector(".close");
const appendCloseWon = document.querySelector(".closeWon");
const appendCloseLost = document.querySelector(".closeLost");
const appendWonModal = document.querySelector(".modalWon");
const appendLostModal = document.querySelector(".modalLost");
const appendButtonEasy = document.getElementById("easy");
const appendButtonMedium = document.getElementById("medium");
const appendButtonHard = document.getElementById("hard");
const appendButtonNewGame = document.getElementById("buttonNewGame");
const appendButtonRestart = document.querySelector(".buttonRestart");
const appendBombInput = document.getElementById("bombInput");
const appendSizeInput = document.getElementById("sizeInput");
///////////////////////////////////////
// Functions                        //
/////////////////////////////////////

const gameInit = function (mineCount, fieldSize) {
  clearInterval(interval);
  mineFieldSizeX = fieldSize;
  mineFieldSizeY = fieldSize;
  mineFieldMatrix = [];
  mineCount = mineCount;
  flagCount = mineCount + mineCount * 0.25;
  time = 0;
  mineDiscovered = 0;

  appendMineCount.textContent = mineCount;
  document.getElementById(`mineField`).setAttribute(
    `style`, // Set the size of the mine field
    `width: ${mineFieldSizeX * 27}px`, // 27px is the width of a tile
    `height: ${mineFieldSizeY * 27}px` // 27px is the height of a tile
  );
  (document.querySelector(`.container`).setAttribute = `style`),
    `height: ${0.047 * mineFieldSizeY * 100}%`;

  generateMineField(
    mineFieldSizeX,
    mineFieldSizeY,
    flagCount,
    mineCount,
    mineDiscovered,
    mineFieldMatrix
  );
};

const generateMineField = (
  mineFieldSizeX,
  mineFieldSizeY,
  flagCount,
  mineCount,
  mineDiscovered,
  mineFieldMatrix
) => {
  let mineField = document.getElementById("mineField");
  mineField.innerHTML = ""; // Clear the mine field

  for (let x = 0; x < mineFieldSizeX; x++) {
    let row = [];
    for (let y = 0; y < mineFieldSizeY; y++) {
      let tile = document.createElement("div"); // Create a new tile
      tile.classList.add("tile");
      tile.classList.add("closed");
      tile.id = `t-${x}-${y}`; // Give the tile an id

      // Left click
      tile.addEventListener("click", mineClick);

      // Right click
      tile.addEventListener("contextmenu", (e) => {
        e.preventDefault(); // Prevents the context menu from appearing
        // only flag If the tile is closed
        if (tile.classList.contains(`closed`)) {
          if (tile.classList.contains(`flag`)) {
            tile.classList.toggle("flag");
            flagCount++;
          } else {
            if (flagCount > 0) {
              if (tile.classList.contains(`bomb`)) mineDiscovered++;
              if (mineDiscovered === mineCount) gameWon();
              tile.classList.toggle("flag");
              flagCount--;
            }
          }
        }
        console.log(
          `MineCount: ${mineCount}, MineDiscovered: ${mineDiscovered}, FlagCount: ${flagCount}`
        );
      });

      mineField.appendChild(tile);
      row.push(tile);
    }
    mineFieldMatrix.push(row);
  }

  // Generate random bombs
  generateRandomBombs(mineCount);

  //Add tile numbers
  for (let x = 0; x < mineFieldSizeX; x++) {
    for (let y = 0; y < mineFieldSizeY; y++) {
      setTileNumber(mineFieldMatrix[x][y], x, y);
    }
  }

  //Starting the timer
  interval = setInterval(startTimer, 1000);
};

const openAdjacentEmptyTiles = function (tile) {
  // Check all tiles around the tile
  let tileId = tile.id.split("-");
  let xTile = parseInt(tileId[1]);
  let yTile = parseInt(tileId[2]);
  for (let x = xTile - 1; x <= xTile + 1; x++) {
    if (x < 0 || x >= mineFieldSizeX) continue; // If the tile is outside the mine field, skip it

    for (let y = yTile - 1; y <= yTile + 1; y++) {
      if (y < 0 || y >= mineFieldSizeY) continue; // If the tile is outside the mine field, skip it

      if (!mineFieldMatrix[x][y].classList.contains(`closed`)) continue; // If the tile is already open, skip it

      if (mineFieldMatrix[x][y].classList.contains(`empty`)) {
        mineFieldMatrix[x][y].classList.remove("closed"); // Open the tile

        // If the tile is empty, check all tiles around it
        openAdjacentEmptyTiles(mineFieldMatrix[x][y]);
      }
      // If the tile is not empty, aka a numbered tile, open it
      else {
        mineFieldMatrix[x][y].classList.remove("closed"); // Open the tile
      }
    }
  }
};

const openAllTiles = function () {
  for (let x = 0; x < mineFieldSizeX; x++) {
    for (let y = 0; y < mineFieldSizeY; y++) {
      mineFieldMatrix[x][y].classList.remove("closed");

      if (mineFieldMatrix[x][y].classList.contains(`bomb`)) {
        mineFieldMatrix[x][y].setAttribute(
          "style",
          "border: 1px dashed darkblue"
        );
      }
    }
  }
};

const generateRandomBombs = function (mineCount) {
  let bombs = 0;
  while (bombs < mineCount) {
    let x = Math.floor(Math.random() * mineFieldSizeX);
    let y = Math.floor(Math.random() * mineFieldSizeY);
    if (!mineFieldMatrix[x][y].classList.contains("bomb")) {
      mineFieldMatrix[x][y].classList.add("bomb");
      bombs++;
    }
  }
};

// Left click on a tile
const mineClick = function (e) {
  let tile = this;

  // Cant click a tile that is flagged
  if (!tile.classList.contains("flag")) {
    if (tile.classList.contains("bomb")) gameOver();

    if (tile.classList.contains("empty")) {
      openAdjacentEmptyTiles(tile);
    } else {
      tile.classList.remove("closed");
    }
  }
};

// Set the number of the tile
const setTileNumber = function (tile, xTile, yTile) {
  let adjacentMines = 0;
  // Check all tiles around the tile
  for (let x = xTile - 1; x <= xTile + 1; x++) {
    if (x < 0 || x >= mineFieldSizeX) continue; // If the tile is outside the mine field, skip it

    for (let y = yTile - 1; y <= yTile + 1; y++) {
      if (y < 0 || y >= mineFieldSizeY) continue; // If the tile is outside the mine field, skip it
      if (y === yTile && x === xTile) continue; // If the tile is the tile we are checking, skip it

      if (mineFieldMatrix[x][y].classList.contains(`bomb`)) adjacentMines++;
    }
    tile.textContent = adjacentMines;
  }
  //Empty mine
  if (!(adjacentMines === 0)) {
    tile.classList.add(`mine-${adjacentMines}`); // Add a class to the tile to change the color of the number`
  } else {
    tile.textContent = ""; // If there are no adjacent mines, remove the number
    tile.classList.add(`empty`);
  }
};

const gameWon = function () {
  openAllTiles();
  alert("You Win");

  clearInterval(interval);
  openResetGameModal();
};

const gameOver = function () {
  openAllTiles();
  alert("You Lose");
  clearInterval(interval);
  openResetGameModal();
};

const resetGame = function () {
  mineCount = parseInt(appendBombInput.value);
  size = parseInt(appendSizeInput.value);
  gameInit(mineCount, size);
  closeResetModal();
};

const startTimer = function () {
  time++;
  if (time === 99)
    document
      .getElementById(`count-timer`)
      .setAttribute(`style`, `font-size: 1.75rem`);
  if (time === 999)
    document
      .getElementById(`count-timer`)
      .setAttribute(`style`, `font-size: 1.2rem`);
  if (time === 9999)
    document
      .getElementById(`count-timer`)
      .setAttribute(`style`, `font-size: 1rem`);
  appendTimerCount.textContent = time;
};

const openResetGameModal = () => {
  appendResetModal.classList.remove("hidden");
  appendBgBlur.classList.remove("hidden");
  appendResetModal.focus();
};

const openWonGameModal = () => {
  appendWonModal.classList.remove("hidden");
  appendBgBlur.classList.remove("hidden");
  appendWonModal.focus();
};

const openLostGameModal = () => {
  appendLostModal.classList.remove("hidden");
  appendBgBlur.classList.remove("hidden");
  appendLostModal.focus();
};

const closeResetModal = function () {
  appendResetModal.classList.add("hidden");
  appendBgBlur.classList.add("hidden");
};

const closeWonModal = function () {
  appendWonModal.classList.add("hidden");
  appendBgBlur.classList.add("hidden");
};

//#TODO: Stop timer once the game is over
//    Record the time it took to complete the game

///////////////////////////////////////
//Run on load
/////////////////////////////////////

//Reset game when clicking the reset button
appendButtonNewGame.addEventListener("click", resetGame);

//Close and open modal with keypress
document.addEventListener("keydown", (e) => {
  console.log(e.key);

  if (e.key === "R" || e.key === "r") openResetGameModal();
  if (e.key === "Escape") closeResetModal();

  if (e.key === `Enter`) resetGame();
});

//Close modal with click on X
appendClose.addEventListener("click", closeResetModal);
//Open modal with click on retry butotn
document.querySelector(`.retry`).addEventListener(`click`, openResetGameModal);

//Reset easy game
document.querySelector(`.easy`).addEventListener(`click`, () => {
  closeResetModal();
  gameInit(2, 5);
});

//Reset medium game
document.querySelector(`.medium`).addEventListener(`click`, () => {
  closeResetModal();
  gameInit(10, 10);
});

//Reset hard game
document.querySelector(`.hard`).addEventListener(`click`, () => {
  closeResetModal();
  gameInit(20, 15);
});

//Set default values for the input
appendBombInput.value = 2;
appendSizeInput.value = 5;

resetGame();
// appendGameContainer.classList.add("hidden");
console.log(mineFieldMatrix);
