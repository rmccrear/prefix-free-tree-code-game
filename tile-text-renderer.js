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
  static print(tiles){
    let colNumbers = ['  '];
    const rowLen = tiles.length;
    const colLen = tiles[0].length;
    for(let i = 0; i< colLen; i++){
      colNumbers.push(i);
    }
    console.log(colNumbers.join(''));
    for(let i = 0; i < rowLen; i++){
      let row = [i];
      let tilesInRow = tiles[i].map((tile) => glyphs[tile.p]);
      console.log(i + ' ' + tilesInRow.join(''));
    }

  }
}


module.exports = TileTextRenderer;
