"use strict";

let $ = require('jquery');
let Hammer = require('hammerjs');
let Bacon = require('baconjs');
// let _ = require('lodash');

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
let done = false;

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
  treeBuilder.buildFromLetterString(letters);
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
}

function isLeaf(){
  const tile = board.getCurrTile();
  if(tile.p === 'A'){
    return tile;
  }
  else{
    return false;
  }
}
function isDone(){
  if(bitProgressCounter>=encodedMessage.length){
    done = true;
    // $('body').addClass('done');
    $('.decoded-letter').addClass('done');
  }
  return done;
}

function lightUpLeaf(node){
  console.log('light up leaf');
  let leafTiles = board.tiles.asFlatArray().filter((t)=>t.n===node);
  let leafDivs = leafTiles.map((leaf)=>$(`[data-row=${leaf.row}][data-col=${leaf.col}] .pipe-tile`));
  window.setTimeout( function(){
    leafDivs.forEach((div)=>div.addClass('pipe-red'));
    let alphaDiv = leafDivs.pop();
    window.setTimeout(function(){
      leafDivs.forEach((div)=>div.removeClass('pipe-red'));
      window.setTimeout(function(){
        alphaDiv.removeClass('pipe-red');
      }, 500);
    }, 300);
  }, 50);
}

function handleAtLeaf(leafTile) {
  console.log('handling leaf ' + leafTile.l)
  const n = leafTile.n;
  const letter = leafTile.l;
  lightUpLeaf(leafTile.n);
  board.setCurrTileToRoot();
  createjs.Sound.play('drain');
  createjs.Sound.play('type');
  const letterRepresentation = (letter === ' ' ? '&nbsp;' : letter); // TODO: check for other punctuation
  const letterElm = $(`<div class="decoded-letter">${letterRepresentation}</div>`);
  // $('#decoded-message').append(letterElm).addClass('animated fadeInDownBig');
  letterElm.appendTo('#decoded-message').addClass('animated bounceInUp');
  $('.current-letter-bit-already-done').removeClass('current-letter-bit-already-done').addClass('bit-already-done');
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
  if(isDone()){
    $('.make-your-own').addClass('show');
  }
  showGuide(encodedMessage[bitProgressCounter]);
}



let guideElm = null;
let showGuideCount = 0;
function showGuide(direction, message){
  hideGuide();
  if(direction) {
    // message = message || 'press arrow key';
    message = (showGuideCount < 5) ? `<div class="hint-message desktop">press arrow key</div> <div class="hint-message mobile">swipe</div> `: '';
    const directionGlyph = {'L': '⇦', 'R': '⇨', 'U': '⇧'}[direction];
    // const directionGlyph = {'L': '&larr;', 'R': '&rarr;', 'U': '&uarr;'}[direction];
    const currTile = board.getCurrTile();
    const pixelSize = 32;
    const currTileTop = currTile.row * pixelSize;
    const currTileLeft = currTile.col * pixelSize;
    const locationTop = `${currTileTop - 0*pixelSize}px`;
    const locationLeft = (direction === 'L') ? `${currTileLeft - 1*pixelSize}px` : `${currTileLeft + 1*pixelSize}px`;
    const hintElm = $(`<div class="hint" style="top: ${locationTop}; left: ${locationLeft};">${message}<span class="hint-glyph">${directionGlyph}</span></div>`);
    guideElm = hintElm;
    $('#board .board-inner').append(hintElm);
    let animation = ' pulse';
    if(direction === 'L') animation = ' slideInRight'; 
    if(direction === 'R') animation = ' slideInLeft'; 
    guideElm.addClass('animated ' + animation);
    showGuideCount++;
  }
}

function hideGuide(){
  if (guideElm){
    let guideElmToRemove = guideElm;
    window.setTimeout(()=>guideElmToRemove.remove(), 500);
    // guideElm.remove();
    guideElm = null;
  }
}


function goLeft(){
  let isCorrect = checkEncodedBit('L');
  let leaf = null;
  // if(isCorrect){
    board.go('L');
    createjs.Sound.play('drip');
    leaf = leafCheck();
  // }
  if(isCorrect){
    return 'correct-L';
  }
  else if (leaf){
    return 'wrong-at-leaf';
  }
  else{
    return 'wrong';
  }
}
function goRight(){
  let isCorrect = checkEncodedBit('R');
  let leaf = null;
  // if(isCorrect){
    board.go('R');
    createjs.Sound.play('drip');
    leaf = leafCheck();
  // }
  if(isCorrect){
    return 'correct-R';
  }
  else if (!isCorrect && leaf){
    return 'wrong-at-leaf';
  }
  else{
    return 'wrong';
  }
}
function goUp(){
  let status = 'correct';
  if(incorrectDepth > 0){ // if player has made a mistake previously...
    if(board.go('U') === 1){ // at root node start over
      console.log('restart at start of current letter');
      //roll back to last correct spot in code
      incorrectDepth = 0;
      $(`[data-encoded-bit-index=${bitProgressCounter}]`).removeClass('current-bit');
      bitProgressCounter = startOfCurrentLetter;
      $(`[data-encoded-bit-index=${bitProgressCounter}]`).addClass('current-bit');
      status = 'correct';
    }
    else{
      incorrectDepth--;
      if(incorrectDepth>0){
        console.log('go up! ' + incorrectDepth);
        status = 'please-continue-up';
      }
      console.log('incorrectDepth: ' + incorrectDepth);
    }
  }
  else {
    // do nothing if player hasn't made a mistake.
    // showGuide(encodedMessage[bitProgressCounter]);
    status = 'correct';
  }
  return status;
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
    $(`[data-encoded-bit-index=${bitProgressCounter}]`).addClass('current-letter-bit-already-done');
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

function afterMove(status){
      if(status === 'correct' || status==='correct-L' || status==='correct-R'){
        console.log('is correct ....' + status)
        if(status === 'correct-L' && guideElm){
          guideElm.addClass('animated flipOutX');
        }
        else if(status === 'correct-R' && guideElm){
          guideElm.addClass('animated flipOutX');
        }
        showGuide(encodedMessage[bitProgressCounter]);
      } else if(status === 'wrong-at-leaf'){
        console.log('wrong at leaf');
        showGuide(encodedMessage[bitProgressCounter]);
      } else if(status === 'wrong') {
        console.log('status: wronge');
        $('#board').addClass('animated shake');
        window.setTimeout(function(){$('#board').removeClass('animated shake');}, 1000);
        showGuide('U');
      } else if('please-continue-up'){
        console.log('status: please continue up');
        showGuide('U');
      }
}


function onReady(){
  try{
    initSounds();
  }catch(e){
    console.log(e);
  }
  const params = queryParams();
  lettersOnTree = params.letters[0];
  encodedMessage = params.encodedmessage[0];
  const encodedMessageElm = renderEncodedMessage(encodedMessage);
  $(encodedMessageElm).appendTo('#encoded-message');
  buildTreeFromLetters(lettersOnTree, board, treeBuilder);
  repaint(board);
  $('[data-encoded-bit-index=0]').addClass('current-bit');

  // initiate Hammer
  let stage = document.getElementById('board');
  let mc = new Hammer.Manager(stage, {touchAction: 'pan-y', recognizers: [[Hammer.Swipe]]});
  // let Swipe = new Hammer.Swipe();
  // mc.add(Swipe);
  mc.on('swipeleft', function(){
    console.log('swipe left');
    const status = goLeft();
    repaint(board);
    afterMove(status);
  });
  mc.on('swiperight', function(){
    const status = goRight();
    repaint(board);
    afterMove(status);
  });
  mc.on('swipeup', function(){
    const status = goUp();
    repaint(board);
    afterMove(status);
  });

  // http://stackoverflow.com/questions/1402698/binding-arrow-keys-in-js-jquery
  $(document).keydown(function(e) {
    let status = 'no-move';
      switch(e.which) {
          case 37: // left
            status = goLeft();
          break;

          case 38: // up
            status = goUp();
          break;

          case 39: // right
            status = goRight();
          break;

          case 40: // down
          break;

          default: return; // exit this handler for other keys
      }
      repaint(board);
      afterMove(status);
      e.preventDefault(); // prevent the default action (scroll / move caret)

  });
  showGuide(encodedMessage[bitProgressCounter]);
  createMoveButton();
}


const createMoveButton = () => {
  console.log('create move button');
  const leftButton = $('<div class="move-button left-move" style="width: 100px; height: 100px; position:fixed; top:88%; left:2%; z-index:9999"> <span class="hint-glyph">⇦</span></div>');
  const rightButton = $('<div class="move-button right-move" style="width: 100px; height: 100px; position:fixed; top:88%; right:0%; z-index:9999"> <span class="hint-glyph">⇨ </span></div>');
  $('.message-container').append(leftButton);
  $('.message-container').append(rightButton);
  // let plus = leftButton.asEventStream("click").map(1)
  let goLeft$ = Bacon.fromEvent(leftButton[0], 'click').map(()=>'L');
  // goLeft$.onValue(function(val) { console.log('clicked '+ val); })
  let goRight$ = Bacon.fromEvent(rightButton[0], 'click').map(()=>'R');
  // goRight$.onValue(function(val) { console.log('clicked '+ val); })
  let go$ = Bacon.mergeAll(goLeft$, goRight$);
  go$.onValue( (val) => {console.log(val);} );
  go$.onValue( (val) => {
    let status;
    if(val === 'R'){
      status = goRight();
    }
    else if(val === 'L'){
      status = goLeft();
    }
    repaint(board);
    afterMove(status);
  } );
}

$(onReady);
