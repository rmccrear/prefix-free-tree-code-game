"use strict";

import chalk from 'chalk';

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
    // const tiles = board.tiles.tiles;
    const tiles = board.tilesToRender();
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
      // let row = [i];
      let glyph = '';
      let tilesInRow = tiles[i].map(function(tile) {
        if(tile.p === 'A'){
          if(typeof tile.l !== 'undefined'){
            glyph = tile.l;
          }
          else{
            glyph = '?';
          }
        }
        else{
          glyph =  glyphs[tile.p];
        }
        if(tile.isCurrTile){
          glyph = chalk.red(glyph);
        }
        else if(tile.isInPath){
          glyph = chalk.blue(glyph);
        }
        return glyph;
      });
      output.push([i + ' '].concat(tilesInRow));
    }

    for(let i = 0; i < output.length; i++){
      console.log(output[i].join(''));
    }

  }
}

export default TileTextRenderer;
