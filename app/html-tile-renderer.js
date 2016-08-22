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
function repaint(board, opts){
  console.log('repaint board');
  opts = opts || {};
  let root = $('<div class="board-inner">');
  let tiles = board.tilesToRender();
  const handleSwap = opts.handleSwap;

  // draw from scratch if first time, or if grid size has changed.
  if(!lastTilePosition || lastTilePosition.length !== tiles.length || lastTilePosition[0].length !== tiles[0].length){
    for(let i=0; i<tiles.length; i++){
      for(let j=0; j<tiles[i].length; j++){
        const t = tiles[i][j];
        const letter = t.l || '';
        const styleStr = style(t);
        const draggable = t.p !== 'A' ? '' : ` draggable=true data-row=${i} data-col=${j} data-n=${t.n} data-l="${t.l}" `;
        const tileContainer = $(`<div class="pipe-container" style="${styleStr}" data-row="${i}" data-col="${j}"></div>`);
        // const tileDiv = $(`<div class="pipe-tile ${classes(t)}" ${draggable}><div class="pipe-letter">${letter}</div></div>`);
        const tileDiv = $(`<div class="pipe-tile ${classes(t)}" ${draggable}><p class="pipe-letter">${letter}</p></div>`);
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
        // implement draggable
        if(lastTile.p === 'A' && tile.p !== 'A'){
          //remove draggable
          $(`[data-row=${i}][data-col=${j}] .pipe-tile`).removeAttr('draggable');
          $(`[data-row=${i}][data-col=${j}] .pipe-tile`).removeData('row').removeData('col').removeData('n').removeData('l');
        }
        // if(lastTile.p !== 'A' && tile.p === 'A'){ // <-- this won't work because we might have changed the letter, so we need to change 'data-l'
        if(tile.p === 'A'){
          $(`[data-row=${i}][data-col=${j}] .pipe-tile`).attr('draggable', true);
          $(`[data-row=${i}][data-col=${j}] .pipe-tile`).data('row', i).data('col', j).data('n', tile.n).data('l', tile.l);
        }
      }
    }
  }
  // interact('.pipe-tile').draggable({
  //   inertia: true,
  //   onend: function(e){console.log(e);}
  // });
  $('.pipe-tile').off('drop');
  $('.pipe-tile').off('dragstart');
  // see: http://www.html5rocks.com/en/tutorials/dnd/basics/
  $('.pipe-tile').on('dragstart', function(e){
    const elm = $(this);
    e.originalEvent.dataTransfer.setData('text/plain',JSON.stringify({l: elm.data('l'), n: elm.data('n'), row: elm.data('row'), col: elm.data('col')}));
    e.originalEvent.dataTransfer.dropEffect = 'move';
    console.log($(this).text());
  });

  $('.pipe-tile.pipe-A').on('dragover', function(e) {
    console.log('drag over')
    if (e.preventDefault) {
      e.preventDefault(); // Necessary. Allows us to drop.
    }
    $(this).addClass('dragover');

    e.originalEvent.dataTransfer.dropEffect = 'move';

    return false;
  })
  .on('dragleave', function() {
    $(this).removeClass('dragover');
  });

  $('.pipe-tile.pipe-A').on('drop', function(e){
    console.log('drop');
    console.log(e.originalEvent.dataTransfer.getData('text/plain'));
    console.log(e);
    var dropped = JSON.parse(e.originalEvent.dataTransfer.getData('text/plain'));
    var target = $(e.target);
    $(this).removeClass('dragover');
    console.log(target);
    if(handleSwap){
      handleSwap({row: dropped.row, col: dropped.col, l: dropped.l}, {row: target.data('row'), col: target.data('col'), l: target.data('l')});
    }
  });

  lastTilePosition = tiles;
}

module.exports = {
  repaint: repaint
};
