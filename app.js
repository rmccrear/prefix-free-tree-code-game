"use strict";

const LetterTree = require('./letter-tree.js');
const TreeBuilder = require('./tree-builder.js');

const jsonTree = require('./data/tree-command-13x25.json');

let board;
let treeBuilder;

board = new LetterTree(jsonTree);
treeBuilder = new TreeBuilder(board, jsonTree.treeBuilder);

function encodeMessage(board, message){
  const letterTiles = board.tiles.asFlatArray((t)=>t.p==='A' && t.l);
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
  let root = $('<div>');
  let tiles = board.tilesToRender();
  for(let i=0; i<tiles.length; i++){
    for(let j=0; j<tiles[i].length; j++){
      const t = tiles[i][j];
      const letter = t.l || '';
      const styleStr = style(t);
      root.append(`<div class="pipe-tile ${classes(t)}" style="${styleStr}">${letter}</div>`);
    }
  }
  $('#board').append(root);
  $('#message').on('input', function(){
    const message = $(this).val();
    updateTreeWithMessage(message);
    const code = encodeMessage(board, message.split(''));
    $('#code').text(code);
  });
};

function repaint(){
  let root = $('<div>');
  let tiles = board.tilesToRender();
  for(let i=0; i<tiles.length; i++){
    for(let j=0; j<tiles[i].length; j++){
      const t = tiles[i][j];
      const letter = t.l || '';
      const styleStr = style(t);
      root.append(`<div class="pipe-tile ${classes(t)}" style="${styleStr}"><div class="pipe-letter">${letter}</div></div>`);
    }
  }
  $('#board').html(root);
}

function updateTreeWithMessage(message){
    let messageChars = _.uniq(message.split(''));
    // remove dups
    messageChars.forEach((letter) => treeBuilder.insertLetter(letter));
    repaint();
}


$(onReady);
