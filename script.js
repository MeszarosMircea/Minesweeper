let grid; 
let cols; 
let rows; 
let w = 40; // from width 
let totalBombs = 0;
let flagsLeft = 10;
let revealedCount = 0;
let gameStarted = false;

const startButton = document.getElementById("startButton");

function startGame() {
  let numarBombe = document
    .getElementById("numar-bombe-value")
    .textContent.slice(0, -2);
  numarBombe = parseInt(numarBombe);
  totalBombs = numarBombe;
  flagsLeft = totalBombs;
  let gameOverElement = document.getElementById("gameOver");
  gameOverElement.innerHTML = "";
  setup();
}

// create a 2D array with a defined "columns" and "rows"
function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; ++i) {
    arr[i] = new Array(rows);
  }
  return arr;
}

// I assume for a start that each cell contains a bomb and is revealed
function Cell(i, j, w) {
  this.i = i; // starting point i (to the right) for the square
  this.j = j; // starting point j (down) for the square
  this.x = i * w;
  this.y = j * w;
  this.w = w; // the length of the side of the square
  this.neighborCount = 0; 
  this.bomb = false; 
  this.revealed = false; 
}

Cell.prototype.show = function () {
  // applies to all cells
  textSize(this.w * 0.75); // I set the size of the content at the beginning (numbers and bombs);
  b = random(60, 255); // variable b -> takes random values ​​between 60 and 255
  fill(mouseX, b, mouseY); // fill the box with variable RGB colors - depending on the position of the mouse and b
  rect(this.x, this.y, this.w); // I draw a square x(to the right), y(down), w(width) for the square
  if (this.revealed) {
    // if the box is discovered
    if (this.bomb) {
      // if it is a bomb
      text("💣", this.x + this.w * 0.05, this.y + this.w * 0.75); // displays an emoticon, the bomb starts (half and 2/3 of the box)
    } else {
      fill(50); // fills the color of the box in which I display the number of bombs from the neighbors
      rect(this.x, this.y, this.w);
      if (this.neighborCount > 0) {
        // if the number of bombs in the neighbors is greater than 0 then:
        if (this.neighborCount == 1) {
          // for 1 bomb -> green
          fill(0, 255, 0);
        }
        if (this.neighborCount == 2) {
          // for 2 bombs -> blue
          fill(0, 0, 255);
        }
        if (this.neighborCount >= 3) {
          // for 3 bombs or more -> red
          fill(255, 0, 0);
        }
        text(this.neighborCount, this.x + this.w * 0.3, this.y + this.w * 0.8); // displays the number of bombs in the neighbors
      } else {
        fill(255, 255, 0); // for 0 neighbors I fill the box with yellow
        rect(this.x, this.y, this.w);
      }
    }
  } else {
    // if it is not discovered
    if (this.flag) {
      // if it contains a flag then
      text("🚩", this.x + this.w * 0.05, this.y + this.w * 0.75); // display the flag at the coordinate (1/2 and 2/3)
    }
  }
};

// this function counts the bombs from the neighbors of the selected cell;
Cell.prototype.countBombs = function () {
  if (this.bomb) {
    // if the selected cell contains the bomb then neighborCount =-1
    this.neighborCount = -1;
  }
  let total = 0; // declare a variable total = 0;
  for (let xoff = -1; xoff <= 1; ++xoff) {
    // check the 8 neighbors
    for (let yoff = -1; yoff <= 1; ++yoff) {
      let i = this.i + xoff;
      let j = this.j + yoff;
      if (i > -1 && i < cols && j > -1 && j < rows) {
        // I take into account if I'm on the edge
        let neighbor = grid[i][j]; // assign the neighbor variable the contents of the box
        if (neighbor.bomb) {
          // if it contains the bomb then
          ++total; // increment in total.
        }
      }
    }
  }
  this.neighborCount = total; // nC = nr of bombs.
}

// the point is inside if x is between x and x + w;
//                    and y is between y and y + w;
Cell.prototype.contains = function (x, y) {
// receives 2 parameters and checks
  return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w; // if the point is inside (mouse)
};

// define the reveal function for the Cell object
Cell.prototype.reveal = function () {
  this.revealed = true; 
  ++revealedCount; 
  if (this.flag) {
   
    this.flag = false; // remove the flag                                                  
    ++flagsLeft; // increase the number of available flags                              
    document.getElementById("flagsLeft").innerHTML = flagsLeft + "🚩"; // update the display
  }
  if (this.neighborCount == 0) {
    // if nC = 0 then enter the function floodFill();
    this.floodFill();
  }
}

Cell.prototype.floodFill = function () {
  // floodFill function (check all neighbors)
  for (let xoff = -1; xoff <= 1; ++xoff) {
    for (let yoff = -1; yoff <= 1; ++yoff) {
      let i = this.i + xoff;
      let j = this.j + yoff;
      if (i > -1 && i < cols && j > -1 && j < rows) {
        let neighbor = grid[i][j]; // assign the neighbor variable the value from grid[i][j]
        if (!neighbor.bomb && !neighbor.revealed) {         
          // if the neighbors do not contain the bomb and the neighbors have not been discovered
          neighbor.reveal(); // --> then reveal the neighbors
        }
      }
    }
  }
}

function setup() {
  createCanvas(410, 410); // set the canvas to 410 pixels / 410 pixels
  cols = floor(width / w); //width 410 / 40 => 10 whole number(floor)
  rows = floor(height / w); // height 410 / 40 => 10 integer (floor)
  grid = make2DArray(10, 10); // grid equal to 10 columns and 10 rows
  for (let i = 0; i < cols; ++i) {
    for (let j = 0; j < rows; ++j) {
      grid[i][j] = new Cell(i, j, w); // each grid[i][j] builds a square
    }
  }

  //Pick totalBombs spots
  let options = []; // I create a 2D array
  for (let i = 0; i < cols; ++i) {
    for (let j = 0; j < rows; ++j) {
      options.push([i, j]); // add all the possible coordinates in the matrix, that is option[0][0] = 00;
    }
  }

  for (let n = 0; n < totalBombs; ++n) {
    // until n is less than no of bombs
    let index = floor(random(options.length)); // index = an integer taken randomly between 0 and the length of the option vector (contains co-donates)
    let choice = options[index]; // choice = option [random number];
    let i = choice[0]; // extract the crown i = choice[0] from choice
    let j = choice[1]; // extract the crown j = choice[1] from choice
    options.splice(index, 1); // remove choise from option so it won't be chosen again
    grid[i][j].bomb = true; // marks grid[i][j] as a bomb
  }

  for (let i = 0; i < cols; ++i) {
    for (let j = 0; j < rows; ++j) {
      grid[i][j].countBombs(); // call the countBombs() function to check all its neighbors
    }
  }
  document.getElementById("flagsLeft").innerHTML = flagsLeft + "🚩"; // display the number of flags from the beginning;
}

// in functia de desen(in bucla)
function mousePressed() {
  // when a mouse click is pressed
  if (mouseButton === LEFT) {
    // if it is left click
    for (let i = 0; i < cols; ++i) {
      // check each box if it contains the mouse click
      for (let j = 0; j < rows; ++j) {
        if (grid[i][j].contains(mouseX, mouseY)) {
          grid[i][j].reveal(); // when I left click on the mouse I get disclosure
          if (grid[i][j].bomb) {
            // if grid[i][j] contains a bomb then
            gameOver(); // enter the gameOver() function
          }
          if (flagsLeft === 0 && revealedCount + totalBombs === 100) {
            // if remaining flags = 0 and discovered boxes + total bombs = 100
            gameOver(); // enter the gameOver() function
          }
        }
      }
    }
  }
  if (mouseButton === RIGHT) {
    // if I pressed right click
    for (let i = 0; i < cols; ++i) {
      for (let j = 0; j < rows; ++j) {
        if (grid[i][j].contains(mouseX, mouseY)) {
          // check if the box grid[i][j] contains the click
          document.addEventListener("contextmenu", function (event) {
            event.preventDefault(); // prevent the context menu from appearing
          })
          if (!grid[i][j].revealed && !grid[i][j].flag) {
            // if it was not disclosed and has no flag
            if (flagsLeft > 0) {
              // if the number of remaining flags is greater than 0
              grid[i][j].flag = true; // set the flag
              --flagsLeft; // decrement no of flags
              document.getElementById("flagsLeft").innerHTML = flagsLeft + "🚩"; // display no of flags + flag emoticon
              if (flagsLeft === 0 && revealedCount + totalBombs === 100) {
                // if flags left = 0 and boxes discovered + number of bombs = 100
                gameOver(); // enter in the gameOver() function
              }
            }
          } else {
            if (!grid[i][j].revealed && grid[i][j].flag) {
              // if it is not discovered and contains a flag
              grid[i][j].flag = false; // clear the flag                                   
              ++flagsLeft; 
              document.getElementById("flagsLeft").innerHTML = flagsLeft + "🚩"; // show updated again
            }
          }
        }
      }
    }
  }
}

function gameOver() {
  let gameOverElement = document.getElementById("gameOver");
  if (flagsLeft === 0 && revealedCount + totalBombs === 100) {  
    gameOverElement.innerHTML = "You won! 🚩"; 
  } else {
    gameOverElement.innerHTML = "Game Over! ☢️"; 
    for (let i = 0; i < cols; ++i) {
      for (let j = 0; j < rows; ++j) {
        let cell = grid[i][j];
        cell.revealed = true; // revealed all the boxes
      }
    }
  }
}

function draw() {
  // is used to update and display the graphics
  background(70, 150, 160); // display gray background
  for (let i = 0; i < cols; ++i) {
    for (let j = 0; j < rows; ++j) {
      grid[i][j].show(); // grid [i][j displays the content of each box;
    }
  }
}

const resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", resetGame);

function resetGame() {
  let gameOverElement = document.getElementById("gameOver");
  gameOverElement.innerHTML = "";
  revealedCount = 0;
  startGame();
}
