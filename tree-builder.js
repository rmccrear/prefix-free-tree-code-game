"use strict";

class TreeBuilder{
  constructor(board, commands){
    this.board = board;
    this.commands = commands;
    this.count = 0;
    this.offsets = {row: 0, col: 0};
    this.currIndex = 0;
    this.lastNode = board.getCurrTile();
  }

  insertLetter(letter, node){
    let letterTile;
    const boardsCurrTile = this.board.getCurrTile();
    this.board.setCurrNodeTile(this.lastNode);
    if (node){
    }
    else if(!node && !this.board.hasLetter(letter)){
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

  // private helpers below
  nextInCommandArray(){
    if(this.currIndex >= this.commands.length){
      this.currIndex = 0;
    }
    return this.commands[this.currIndex++];
  }

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
