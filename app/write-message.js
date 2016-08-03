"use strict";

const LetterTree = require('../letter-tree.js');
const TreeBuilder = require('../tree-builder.js');

const jsonTree = require('../data/tree-command-13x25.json');


let board;
let treeBuilder;

board = new LetterTree(jsonTree);
treeBuilder = new TreeBuilder(board, jsonTree.treeBuilder);

window.letterTree = board;

// sounds


function updateTreeWithMessage(message){
    let messageChars = _.uniq(message.split(''));
    let lastLetterTile;
    // remove dups
    messageChars.forEach((letter) => lastLetterTile = treeBuilder.insertLetter(letter));
    // if not a new letter, set last letter tile to the tile of the last letter
    if(!lastLetterTile){
      const lastLetter = message[message.length-1];
      const node = board.hasLetter(lastLetter);
      if(node){
        lastLetterTile = board.tiles.asFlatArray().filter((t) => t.n===node && t.p === 'A')[0];
      }
    }
    return lastLetterTile;
}

function encodeMessage(board, message){
  const letterTiles = board.tiles.asFlatArray().filter((t)=>t.p==='A' && t.l);
  const letterMapArr = letterTiles.map((t) => [t.l, board.tree.encodingOf(t.n)]);
  const letterMap = new Map(letterMapArr);
  return message.map((letter)=>letterMap.get(letter).join('')).join(' ');
}

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

const onReady = function(){
  createjs.Sound.registerSound({src:"app/media/sounds/75343__neotone__drip1.wav", id:"drip"});
  repaint();
  // let root = $('<div>');
  // let tiles = board.tilesToRender();
  // for(let i=0; i<tiles.length; i++){
  //   for(let j=0; j<tiles[i].length; j++){
  //     const t = tiles[i][j];
  //     const letter = t.l || '';
  //     const styleStr = style(t);
  //     root.append(`<div class="pipe-tile ${classes(t)}" style="${styleStr}">${letter}</div>`);
  //   }
  // }
  // $('#board').append(root);
  $('#message').on('input', function(){
    createjs.Sound.play("drip");
    const message = $(this).val();
    const letterTile = updateTreeWithMessage(message);
    board.setCurrNodeTile(letterTile);
    const code = encodeMessage(board, message.split(''));
    $('#code').text(code);
    repaint();
  });
};

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
function repaint(){
  let root = $('<div>');
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



$(onReady);
