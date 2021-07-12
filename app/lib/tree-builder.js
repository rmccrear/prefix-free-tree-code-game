"use strict";

/**
 * Using a string of "commands" build a tree on a LetterTree board
 * goto changes the cursor
 * D goes down and creates new leaves
 * "[" and "]" move the cursor left or right.
 *  offsetBy lets us reuse the commands from the start by adding a given amount to the goto command
 * A set of commands would be:
 * "treeBuilder": [
      {"command": "goto", "pos": {"row": 2, "col": 8}},
      "D",
      "]", "D", "]", "D", "]", "D",
      "[", "D", "[", "D", "[", "D", "[", "D",
      {"command": "goto", "pos": {"row": 2, "col": 2}},
      "D",
      "[", "D",
      "]", "D", "]", "D", "]", "D", "]", "D",
      "[", "D", "[", "D",
      {"command": "offsetBy", "offset": {"row": 8, "col": 0}}
    ]
 */
class TreeBuilder{
  /**
   * The commands come in an array, which is a list of commands to build a tree
   * The possible commands are:
   * "[": Navigate left
   * "]": Navigate right
   * "D": Create new leafs if current node is a leaf
   * {"command": "goto", "col": x, "row": y} set current tile to col, row
   * {"command": "offsetBy", "col": x, "row": y}  offsetBy accumulates a given ammount to the rows, cols when building commands
   *                                             It allows you to continue building a tree infintely by looking through the commands. 
   *                                             The last command can be offsetBy, be sure to set the offset 
   *                                             such that the commands start from a node in the board.
   * @param {Object} board LetterTree instance
   * @param {Array} commands
   */
  constructor(board, commands){
    this.board = board;                 // the board we wish to control
    this.commands = commands;           // the array of comands to execute, in order
    //this.count = 0;
    this.offsets = {row: 0, col: 0};     // the offset starts at (0,0). As your tree grows, the offset can increase and 
    this.currIndex = 0;                  // position in the command array
    this.lastNode = board.getCurrTile(); //current tile
  }

  /**
   * Put letter into next empty leaf, or branch a new leaf for the letter.
   * 
   * @param {String} letter The letter to add
   */
  insertLetter(letter){
    let letterTile;
    const boardsCurrTile = this.board.getCurrTile();
    this.board.setCurrNodeTile(this.lastNode);
    if(this.board.hasLetter(letter)===false){
      letterTile = this.board.setLetterInFirstEmptyLeaf(letter);
      if(typeof letterTile === 'undefined'){
        this.nextBuildOut();
        letterTile = this.board.setLetterInFirstEmptyLeaf(letter);
      }
    }
    this.lastNode = this.board.getCurrTile();
    this.board.setCurrNodeTile(boardsCurrTile);
    return letterTile;
  }

  /**
   * Build the tree and board from a message.
   * @param {String} letters a string of letters to build the tree for.
   */
  buildFromLetterString(letters){
    for(let i=0; i<letters.length; i++){
      this.insertLetter(letters[i]);
    }
  }

  //
  // private helpers below
  //
  /**
   * execute commands until a new leaf is formed
   */
  nextBuildOut(){
    let next = '';
    while(next !== 'D'){
      next = this.nextCommand();
      if(typeof next.command=== 'undefined'){
        this.commandTree(next)
      }
      else if(next.command === 'goto'){
        const t =
          this.board.tiles.tiles[next.pos.row][next.pos.col];
        this.board.setCurrNodeTile(t);
      }
    }
  }

  /**
   * Execute a single command on the tree
   * @param {String} command A string or object representing a command
   *                                '[' goes left ']' goes right 'D' Goes down and creates a new leaf
   */
  commandTree(command){
    const next = command;
    if(next === ']' || next === '['){
      if(next === '['){
        this.board.go('L');
      }
      else if(next === ']'){
        this.board.go('R');
      }
    }
    else if(next === 'D'){
        this.board.branchOut(this.board.tiles.tiles[this.board.currTile.row][this.board.currTile.col]);
    }
  }

  /**
   * @returns rawCommand Returns a raw command from the array, looping if we reach the end.
   */
  nextInCommandArray(){
    if(this.currIndex >= this.commands.length){
      this.currIndex = 0; // repeat from the begining. Be sure to use the offset command at the end or this won't work.
    }
    return this.commands[this.currIndex++];
  }

  /**
   * Gets the next command for this.commandTree(), after first executing any offsetBy commands.
   * And altering goto commands according to the offset.
   * @returns command
   */
  nextCommand(){
    let next = this.nextInCommandArray();

    while(next.command === 'offsetBy'){
      this.offsets.row += next.offset.row;
      this.offsets.col += next.offset.col;
      next = this.nextInCommandArray();
    }

    if(next.command === 'goto'){
      return {
        command: 'goto',
        pos: {
          row: next.pos.row + this.offsets.row,
          col: next.pos.col + this.offsets.col
        }
      };
    } else {
      return next;
    }
  }

}

module.exports = TreeBuilder;
