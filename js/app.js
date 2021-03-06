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
      turn,
      moveCount,
      numOfPlayers = 1,
      result = document.createElement("h2"),

      // To generate dynamically later
      wins = [7, 56, 448, 73, 146, 292, 273, 84], 
      positions = [256,128,64,32,16,8,4,2,1],     


      // Don't know if I need these...
      playerMoves = [],
      computerMoves = [],
      nextMove,

  MoveList = function() {
    this.X = [];
    this.O = [];
  },

  Scoreboard = function() {
    this.X = 0;
    this.O = 0;
  },

  /*
   * Shallow cloning function
   */
  clone = function(obj){
    return JSON.parse(JSON.stringify(obj));
  },

  /*
   * Reset the score, turn and moveCount to the defaults
   */
  startNewGame = function () {
    turn = "X";
    moveCount = 0;
    score = new Scoreboard();
  },

  /*
   * See if the score is higher than the powered score value
   * start from the highest value and moving down
   */
  cellsFromScore = function(tempscore, tempturn){
    // var moveList = new MoveList(),
    //     score,
    //     p = positions.length,
    //     cellValue;

    // for (i in tempscore) {
    //   score = tempscore[i];

    //   for (p; p >= 0; p--) {
    //     if (score === 0) { break }

    //     cellValue = Math.pow(2, p);
    //     if (Math.floor(score/cellValue) > 0) {
    //       moveList[i].push(p);
    //       score -= cellValue;
    //     }
    //   }

    //   p = 0;
    // }
    var moveList = [],
        score,
        p = positions.length,
        cellValue;

    for (i in tempscore) {
      score = tempscore[i];

      for (p; p >= 0; p--) {
        if (score === 0) { break }

        cellValue = Math.pow(2, p);
        if (Math.floor(score/cellValue) > 0) {
          moveList.push(p);
          score -= cellValue;
        }
      }

      p = 0;
    }

    return moveList;
  },

  /*
   * Loop through the played cells and return all the unplayed cells
   */
  possibleMoves = function(played){
    var i = 0,
        unplayed = [];

    for(i; i < 9; i++) {
      // if (played.X.indexOf(i) === -1 && played.O.indexOf(i) === -1) {
      if (played.indexOf(i) === -1) {
        unplayed.push(i);
      }
    }

    return unplayed; 
  },

  minmaxMoves = [],
  minmaxScores = [],

  /*
   * A recursive minmax function that looks up the best move
   */
  minmax = function(tempscore, previousTurn, pMoves, cMoves, depth) {
    var played   = cellsFromScore(tempscore, previousTurn),
        unplayed = possibleMoves(played),
        nextTurn = (previousTurn === "X" ? "O" : "X"),
        i = 0,
        next;

    debugger

    console.log("Unplayed " + unplayed)

    // If the previous turn was a terminal one, return a minmax score
    if (win(tempscore[previousTurn])) {
      return 10 - depth;
    } else if (win(tempscore[nextTurn])) {
      return depth - 10;
    } else if (unplayed.length === 0) {
      return 0;
    } else {

      // Increase the depth
      depth++;

      // Loop through the unplayed moves
      for (i; i < unplayed.length; i++){
        
        // Duplicate the tempscore & the player & computer moves...
        // Might not be necessary
        var tempscore = clone(tempscore);
        var tempPlayerMoves = clone(pMoves);
        var tempComputerMoves = clone(cMoves);

        // Add each unplayed move to the next player's
        if (nextTurn === "X") {
          tempPlayerMoves.push(unplayed[i]);
        } else {
          tempComputerMoves.push(unplayed[i]);
        }

        // Add the move value to the score.
        next = Math.pow(2, unplayed[i]);
        tempscore[nextTurn] += next;

        minmaxMoves.push(unplayed[i]);
        minmaxScores.push(minmax(tempscore, nextTurn, tempPlayerMoves, tempComputerMoves, depth));
      }
    }

    var maxScore = Math.max.apply(null, minmaxScores);
    var minScore = Math.min.apply(null, minmaxScores);
    var maxMove = minmaxMoves[minmaxScores.indexOf(maxScore)];
    var minMove = minmaxMoves[minmaxScores.indexOf(minScore)];

    console.log("minmaxMoves " + minmaxMoves)
    console.log("minmaxScores " + minmaxScores)
    // console.log("maxScore " + maxScore)
    // console.log("minScore " + minScore)
    // console.log(maxMove)
    // console.log(minMove)

    return minMove
    // return minmaxMoves[minmaxScores.indexOf(maxScore)]
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
      // debugger
      computerMoves.push(squares.indexOf(cell));
    }

    cell.firstChild.nodeValue = turn;
    cell.setAttribute("class", turn.toLowerCase());
    moveCount += 1;
    score[turn] += cell.indicator;

    // Check win
    if (win(score[turn])) {
      result.innerHTML = turn + " wins!";
      startNewGame();
    } else if (moveCount === 9) {
      result.innerHTML = "It's a tie";
      startNewGame();
    } else {

      // Change the player (computer is O)
      turn = (turn === "X" ? "O" : "X");
      // console.log(score);
      // console.log(turn);

      // swap turns
      if (numOfPlayers < 2 && turn === "O") {

        // Clone the score object
        var tempscore = clone(score);
        var tempPlayerMoves = clone(playerMoves);
        var tempComputerMoves = clone(computerMoves);
        var tempturn  = turn;

        var next = minmax(tempscore, tempturn, tempPlayerMoves, tempComputerMoves, 0);
        // debugger
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