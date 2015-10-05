/*
 * To determine a win condition, each square is "tagged" from left
 * to right, top to bottom, with successive powers of 2. Each cell
 * thus represents an individual bit in a 9-bit string, and a
 * player's squares at any given time can be represented as a
 * unique 9-bit value. A winner can thus be easily determined by
 * checking whether the player's current 9 bits have covered any
 * of the eight "three-in-a-row" combinations.
 *
 *     273                 84
 *        \               /
 *          1 |   2 |   4  = 7
 *       -----+-----+-----
 *          8 |  16 |  32  = 56
 *       -----+-----+-----
 *         64 | 128 | 256  = 448
 *       =================
 *         73   146   292
 *
 */

 (function () {
  var squares = [], 
      empty = "\xA0",
      score,
      moves,
      turn = "X",
      oldOnload,
      numOfPlayers = 1,
      result = document.createElement("h2"),
      wins = [7, 56, 448, 73, 146, 292, 273, 84], // To generate dynamically later
      positions = [256,128,64,32,16,8,4,2,1], // To generate dynamically later   
      nextMove,
      playerMoves = [],
      computerMoves = [],

  /*
   * Reset the score, turn and moves to the defaults
   */
  startNewGame = function () {
    turn = "X";
    score = {"X": 0, "O": 0};
    moves = 0;
  },

  /*
   * See if the score is higher than the powered score value
   * start from the highest value and moving down
   */
  // cellsFromScore = function(tempscore, tempturn){
  //   // var moveList = { X: [], O: [] },
  //   //     score,
  //   //     p = positions.length,
  //   //     cellValue;

  //   // for (i in tempscore) {
  //   //   score = tempscore[i];

  //   //   for (p; p >= 0; p--) {
  //   //     cellValue = Math.pow(2, p);
  //   //     if (Math.floor(score/Math.pow(2, p)) >= 1) {
  //   //       moveList[i].push(p);
  //   //       score -= cellValue;
  //   //     }
  //   //   }
  //   //   p = 0;
  //   // }

  //   // return moveList;

  //   var moveList = [],
  //       remainingScore,
  //       p = 9,
  //       cellValue;

  //   for (i in tempscore) {
  //     remainingScore = tempscore[i];

  //     for (p; p === 0; p--) {
  //       cellValue = Math.pow(2, p);
  //       console.log(cellValue);
  //       if (Math.floor(remainingScore/cellValue) >= 1) {
  //         moveList.push(p);
  //         remainingScore -= cellValue;
  //       } 
  //     }

  //     debugger
  //     // Reset for the other player
  //     remainingScore = 0;
  //     p = 9;
  //   }

  //   return moveList;
  // },

  /*
   * Return all the unplayed cells
   */
  possibleMoves = function(player, computer){
    var played = player.concat(computer),
        i = 0,
        unplayed = [];

    for(i; i < 9; i++) {
      if (played.indexOf(i) === -1) {
        unplayed.push(i);
      }
    }
    return unplayed; 
  },

  minmaxMoves = [],
  minmaxScores = [],

  minmax = function(tempscore, tempturn, pMoves, cMoves, depth) {
    var possible = possibleMoves(playerMoves, computerMoves),
        opponent = tempturn === "X" ? "O" : "X",
        i = 0,
        next;

    if (win(tempscore[tempturn])) {
      console.log("O wins");
      return 10 - depth;
    } else if (win(tempscore[opponent])) {
      console.log("X wins");
      return depth - 10;
    } else if (possible.length === 0) {
      console.log("Tie");
      return 0;
    } else {

      depth++;

      // console.log(possible);
      for (i; i < possible.length; i++){
        next = Math.pow(2, possible[i]);
        // Add the score next score to the players score
        var tempscore = JSON.parse(JSON.stringify(tempscore));
        var tempPlayerMoves = pMoves;
        var tempComputerMoves = cMoves;

        if (tempturn === "X") {
          tempPlayerMoves.push(possible[i]);
        } else {
          tempComputerMoves.push(possible[i]);
        }

        tempscore[tempturn] += next;
        minmaxMoves.push(possible[i]);
        minmaxScores.push(minmax(tempscore, opponent, tempPlayerMoves, tempComputerMoves, depth));
      }
    }

    var maxScore = Math.max.apply(null, minmaxScores);
    var minScore = Math.min.apply(null, minmaxScores);

    console.log(minmaxMoves)
    console.log(minmaxScores)
    console.log(maxScore)
    console.log(minScore)

    var maxMove = minmaxMoves[minmaxScores.indexOf(maxScore)];
    var minMove = minmaxMoves[minmaxScores.indexOf(minScore)];

    return minmaxMoves[minmaxScores.indexOf(maxScore)]
  },

  /*
   * Returns whether the given score is a winning score.
   * 
   */
  win = function(score) {
    var i;
    // Loop through the winning scores
    for (i = 0; i < wins.length; i++) {
      if ((wins[i] & score) === wins[i]) {
        return true;
      }
    }
    return false;
  },

  /*
   * Sets the clicked-on square to the current player's mark,
   * then checks for a win.  Also changes the current player.
   */
   set = function(e, cell) {
    if (!cell) { cell = this; }
    var nextCell;

    // if (cell.firstChild.nodeValue !== "" || cell.firstChild.nodeValue !== empty) { 
    // Don't play if cell isn't empty 
    if (cell.firstChild.nodeValue !== "") { 
      debugger
      return; 
    }

    if (turn === "X") {
      playerMoves.push(squares.indexOf(cell));
    } else {
      computerMoves.push(squares.indexOf(cell));
    }

    cell.firstChild.nodeValue = turn;
    cell.setAttribute("class", turn.toLowerCase());
    moves += 1;
    score[turn] += cell.indicator;

    // Change the player (computer is O)
    turn = turn === "X" ? "O" : "X";

    // Check win
    if (win(score[turn])) {
      result.innerHTML = turn + " wins!";
      startNewGame();
    } else if (moves === 9) {
      result.innerHTML = "It's a tie";
      startNewGame();
    } else {

      // swap turns
      if (numOfPlayers < 2 && turn === "O") {
        // Clone the score object
        var tempscore = JSON.parse(JSON.stringify(score));
        var tempturn  = turn;

        var next = minmax(tempscore, tempturn, playerMoves, computerMoves, 0);
        
        set(null, squares[next]);
        
        // Reset Minmax containers
        minmaxMoves = [];
        minmaxScores = [];
      }
    }
  },

  /*
   * Creates and attaches the DOM elements for the board as an
   * HTML table, assigns the indicators for each cell, and starts
   * a new game.
   */
   play = function() {
    var board = document.createElement("table"),
    title = document.createElement("h1"),
    indicator = 1,
    i, 
    j,
    row, 
    cell,
    parent;

    title.innerHTML = "Welcome to TicTacToe";
    
    for (i = 0; i < 3; i++) {
      row = document.createElement("tr");
      board.appendChild(row);
      for (j = 0; j < 3; j += 1) {
        cell = document.createElement("td");
        cell.indicator = indicator;
        cell.onclick = set;
        cell.appendChild(document.createTextNode(""));
        row.appendChild(cell);
        squares.push(cell);
        indicator += indicator;
      }
    }

    parent = document.getElementById("tictactoe") || document.body;
    parent.appendChild(title);
    parent.appendChild(board);
    parent.appendChild(result);
    startNewGame();
  };

  /*
   * Add the play function to the (virtual) list of onload events.
   */
   if (typeof window.onload === "function") {
    oldOnLoad = window.onload;
    window.onload = function () {
      oldOnLoad(); 
      play();
    };
  } else {
    window.onload = play;
  }
}());