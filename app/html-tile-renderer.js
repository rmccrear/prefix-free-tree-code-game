"use strict";

var $ = require('jquery');
var _ = require('lodash');

// render 
function classes(tile){
  let c = '';
  const glyphs = {
    L: 'pipe-L',
    R: 'pipe-R',
    T: 'pipe-T',
    H: 'pipe-H',
    V: 'pipe-V',
    A: 'pipe-A',
    E: 'pipe-E'
  };
  c += ' ' + glyphs[tile.p];
  if(tile.isInPath){
    c += ' pipe-red ';
  }
  return c;
}

function style(tile){
  const top = tile.row * 32;
  const left = tile.col * 32;
  return `position: absolute; top: ${top}px; left: ${left}px;`;
}

function diffTiles(tile1, tile2){
  const letter1 = tile1.l;
  const letter2 = tile2.l;
  const classes1 = classes(tile1);
  const classes2 = classes(tile2);
  let letterDiff = null;
  if(letter1 !== letter2){
    letterDiff = letter2;
  }
  let classesAdd = null, classesRemove = null;
  if(classes1 !== classes2){
    const classArr1 = classes1.split(' ').filter((c)=>c !== ''); // remove '' from array
    const classArr2 = classes2.split(' ').filter((c)=>c !== ''); // remove '' from array
    classesRemove = _.difference(classArr1, classArr2).join(" ");
    classesAdd = _.difference(classArr2, classArr1).join(" ");
  }
  return {
    letter: letterDiff,
    classesToAdd: classesAdd,
    classesToRemove: classesRemove
  };
}

let lastTilePosition;
function repaint(board){
  let root = $('<div class="board-inner">');
  let tiles = board.tilesToRender();

  // draw from scratch if first time, or if grid size has changed.
  if(!lastTilePosition || lastTilePosition.length !== tiles.length || lastTilePosition[0].length !== tiles[0].length){
    for(let i=0; i<tiles.length; i++){
      for(let j=0; j<tiles[i].length; j++){
        const t = tiles[i][j];
        const letter = t.l || '';
        const styleStr = style(t);
        const tileContainer = $(`<div class="pipe-container" style="${styleStr}" data-row="${i}" data-col="${j}"></div>`);
        const tileDiv = $(`<div class="pipe-tile ${classes(t)}"><div class="pipe-letter">${letter}</div></div>`);
        tileContainer.append(tileDiv);
        root.append(tileContainer);
        // root.append(`<div class="pipe-tile ${classes(t)}" style="${styleStr}"><div class="pipe-letter">${letter}</div></div>`);
      }
    }
    $('#board').html(root);
  }
  else{
    for(let i=0; i<tiles.length; i++){
      for(let j=0; j<tiles[i].length; j++){
        const tile = tiles[i][j];
        const lastTile = lastTilePosition[i][j]; // TODO: check for growth of grid. Maybe redraw on growth.
        const diff = diffTiles(lastTile, tile);
        if(diff.letter !== null){ // need to check for null because '' is a valid diff value
          $(`[data-row=${i}][data-col=${j}] .pipe-letter`).text(diff.letter);
        }
        if(diff.classesToAdd || diff.classesToRemove){ // no need to check for null, because '' means no change/no diff
          $(`[data-row=${i}][data-col=${j}] .pipe-tile`).addClass(diff.classesToAdd).removeClass(diff.classesToRemove);
        }
      }
    }
  }
  lastTilePosition = tiles;
}

module.exports = {
  repaint: repaint
};
