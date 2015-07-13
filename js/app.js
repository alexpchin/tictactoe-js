/*
 * To determine a win condition, each square is "tagged" from left
 * to right, top to bottom, with successive powers of 2.  Each cell
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
      result = document.createElement("h2"),
      wins = [7, 56, 448, 73, 146, 292, 273, 84],

      startNewGame = function () {
        var i;
        
        turn = "X";
        score = {"X": 0, "O": 0};
        moves = 0;
      },

    /*
     * Returns whether the given score is a winning score.
     */
    win = function(score) {
      var i;
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
    set = function() {
      if (moves === 0) {
        result.innerHTML = "";
        
        // Clear squares
        for (i = 0; i < squares.length; i++) {
          squares[i].firstChild.nodeValue = empty;
          squares[i].setAttribute("class", "");
        }
      }
      if (this.firstChild.nodeValue !== empty) {
        return;
      }
      this.firstChild.nodeValue = turn;
      this.setAttribute("class", turn.toLowerCase());
      moves += 1;
      score[turn] += this.indicator;

      // Check win
      if (win(score[turn])) {
        result.innerHTML = turn + " wins!";
        startNewGame();
      } else if (moves === 9) {
        result.innerHTML = "It's a tie";
        startNewGame();
      } else {
        turn = turn === "X" ? "O" : "X";
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

      // Attach under tictactoe if present, otherwise to body.
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