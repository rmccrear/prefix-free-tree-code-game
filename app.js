
const LetterTree = require('./letter-tree.js');
const TreeBuilder = require('./tree-builder.js');

const jsonTree = require('./data/tree-command-13x25.json');

let board;
let treeBuilder;

board = new LetterTree(jsonTree);
treeBuilder = new TreeBuilder(board, jsonTree.treeBuilder);

function classes(tile){
  const glyphs = {
    L: 'pipe-L',
    R: 'pipe-R',
    T: 'pipe-T',
    H: 'pipe-H',
    V: 'pipe-V',
    A: 'pipe-A',
    E: 'pipe-E'
  };
  return glyphs[tile.p];
}

function style(tile){
  const top = tile.row * 32;
  const left = tile.col * 32;
  return `position: absolute; top: ${top}px; left: ${left}px;`;
}

const onReady = function(){
  console.log('ready');
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

function addLetterToTree(letter){
    treeBuilder.insertLetter(letter);
    repaint();
}
window.addLetterToTree = addLetterToTree;


$(onReady);
