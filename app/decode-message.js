"use strict";

const LetterTree = require('../letter-tree.js');
const TreeBuilder = require('../tree-builder.js');

const jsonTree = require('../data/tree-command-13x25.json');
const repaint = require('./html-tile-renderer.js').repaint;


let board;
let treeBuilder;

board = new LetterTree(jsonTree);
treeBuilder = new TreeBuilder(board, jsonTree.treeBuilder);

window.letterTree = board;

let lettersOnTree = '';
let encodedMessage = '';

//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/21152762#21152762
function queryParams(){
  var qd = {};
  location.search.substr(1).split("&").forEach(function(item) {
      var s = item.split("="),
          k = s[0],
          v = s[1] && decodeURIComponent(s[1]);
      //(k in qd) ? qd[k].push(v) : qd[k] = [v]
      (qd[k] = qd[k] || []).push(v); //short-circuit
  });
  return qd;
}

function buildTreeFromLetters(letters, board, treeBuilder){
  for(let i=0; i<letters.length; i++){
    treeBuilder.insertLetter(letters[i]);
  }
}


function leafCheck(){
  const leaf = isLeaf();
  if(leaf){
    handleAtLeaf(leaf);
    return leaf;
  }
  else{
    return false;
  }
};

function isLeaf(){
  const tile = board.getCurrTile();
  if(tile.p === 'A'){
    return tile;
  }
  else{
    return false;
  }
}

function handleAtLeaf(leafTile) {
  console.log('handling leaf ' + leafTile.l)
  const n = leafTile.n;
  const letter = leafTile.l;
  board.setCurrTileToRoot();
  createjs.Sound.play('drain');
  createjs.Sound.play('type');
  const letterRepresentation = (letter === ' ' ? '&nbsp;' : letter); // TODO: check for other punctuation
  const letterElm = $(`<div class="decoded-letter">${letterRepresentation}</div>`);
  // $('#decoded-message').append(letterElm).addClass('animated fadeInDownBig');
  letterElm.appendTo('#decoded-message').addClass('animated bounceInUp');
  if(incorrectDepth === 0){
    startOfCurrentLetter = bitProgressCounter;
  }
  else{
    console.log('bad letter');
    //reset depth, go back to start of current letter
    // TODO: DRY this up
    incorrectDepth = 0;
    console.log(bitProgressCounter)
    $(`[data-encoded-bit-index=${bitProgressCounter}]`).removeClass('current-bit');
    bitProgressCounter = startOfCurrentLetter;
    $(`[data-encoded-bit-index=${bitProgressCounter}]`).addClass('current-bit');

  }
}

function goLeft(){
  board.go('L');
  createjs.Sound.play('drip');
  leafCheck();
}
function goRight(){
  board.go('R');
  createjs.Sound.play('drip');
  leafCheck();
}
function goUp(){
  return board.go('U');
}

function initSounds(){
            createjs.Sound.registerSound({src:"app/media/sounds/75343__neotone__drip1.wav", id:"drip"});
            createjs.Sound.registerSound({src:"app/media/sounds/51745__erkanozan__bubbles.wav", id:"drain"});
            createjs.Sound.registerSound({src:"app/media/sounds/240839__videog__typing-on-a-typewriter.wav", id:"type"});
}

function renderEncodedMessage(message){
  let messageRoot = $('<div></div>');
  for(let i=0; i<message.length; i++){
    $(`<div class="encoded-bit" data-encoded-bit-index="${i}">${message[i]}</div>`).appendTo(messageRoot);
  }
  return messageRoot;
}

let bitProgressCounter = 0;
let incorrectDepth = 0;
let startOfCurrentLetter = 0;
function checkEncodedBit(input){
  if(input === encodedMessage[bitProgressCounter] && incorrectDepth === 0){
    console.log('good!')
    $(`[data-encoded-bit-index=${bitProgressCounter}]`).removeClass('current-bit');
    bitProgressCounter++;
    $(`[data-encoded-bit-index=${bitProgressCounter}]`).addClass('current-bit');
    $(`[data-encoded-bit-index=${bitProgressCounter}]`).addClass('animated bounce');
    return true;
  }
  else {
    incorrectDepth++;
    return false;
  }
}

function onReady(){
  initSounds();
  const params = queryParams();
  lettersOnTree = params.letters[0];
  encodedMessage = params.encodedmessage[0];
  const encodedMessageElm = renderEncodedMessage(encodedMessage);
  $(encodedMessageElm).appendTo('#encoded-message');
  buildTreeFromLetters(lettersOnTree, board, treeBuilder);
  repaint(board);
  $('[data-encoded-bit-index=0]').addClass('current-bit');
  console.log(params);
  console.log(lettersOnTree);
  // http://stackoverflow.com/questions/1402698/binding-arrow-keys-in-js-jquery
  $(document).keydown(function(e) {
    let isCorrect = true;
      switch(e.which) {
          case 37: // left
          console.log('left');
          isCorrect = checkEncodedBit('L');
          goLeft();
          break;

          case 38: // up
            if(goUp() === 1){
              console.log('restart at start of current letter');
              //roll back to last correct spot in code
              incorrectDepth = 0;
              $(`[data-encoded-bit-index=${bitProgressCounter}]`).removeClass('current-bit');
              bitProgressCounter = startOfCurrentLetter;
              $(`[data-encoded-bit-index=${bitProgressCounter}]`).addClass('current-bit');
            }
            else{
              incorrectDepth--;
            }
          break;

          case 39: // right
          console.log('right');
          isCorrect = checkEncodedBit('R');
          goRight();
          break;

          case 40: // down
          break;

          default: return; // exit this handler for other keys
      }
      repaint(board);
      if(!isCorrect){
        $('#board').addClass('animated shake');
        window.setTimeout(function(){$('#board').removeClass('animated shake');}, 1000);
      }
      e.preventDefault(); // prevent the default action (scroll / move caret)
  });
}






// render TODO: pull out into a class
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

$(onReady);
