"use strict";

const chalk = require('chalk')

const glyphs = {
  'E': ' ',
  'T': '┻',
  'R': '┓',
  'L': '┏',
  'A': '╍',
  'H': '─',
  'V': '┃'
};

class TileTextRenderer {
  static print(board){
    const tiles = board.tiles.tiles;
    let colNumbers = ['  '];
    const rowLen = tiles.length;
    const colLen = tiles[0].length;
    let output = [];
    for(let i = 0; i< colLen; i++){
      colNumbers.push(i);
    }
    // console.log(colNumbers.join(''));
    output.push(colNumbers);
    for(let i = 0; i < rowLen; i++){
      let row = [i];
      let tilesInRow = tiles[i].map(function(tile) {
        if(tile.p === 'A'){
          if(typeof tile.l !== 'undefined')
            return tile.l;
          else
            return '?';
        }
        else{
          return glyphs[tile.p];
        }
      });
      output.push([i + ' '].concat(tilesInRow));
      // console.log(i + ' ' + tilesInRow.join(''));
    }
    const cR = board.currTile.row + 1; // these offsets are the result of adding guide numbers to the first row and col
    const cC = board.currTile.col + 1; // these offsets are the result of adding guide numbers to the first row and col
    output[cR][cC] = chalk.red(output[cR][cC]);
    for(let i = 0; i < output.length; i++){
      console.log(output[i].join(''));
    }

  }
}


module.exports = TileTextRenderer;
