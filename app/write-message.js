"use strict";

const $ = require('jquery');
const _ = require('lodash');

const LetterTree = require('./lib/letter-tree.js');
const TreeBuilder = require('./lib/tree-builder.js');

const jsonTree = require('../data/tree-command-13x25.json');
const repaint = require('./html-tile-renderer.js').repaint;

const createAudioTags = require('./sounds.js').createAudioTags;


const board = new LetterTree(jsonTree);
const treeBuilder = new TreeBuilder(board, jsonTree.treeBuilder);



function updateTreeWithMessage(message){
    let messageChars = _.uniq(message.split(''));
    let lastLetterTile;
    // remove dups
    messageChars.forEach((letter) => {
      lastLetterTile = treeBuilder.insertLetter(letter);
      recordLettersAdded(letter);
    });
    // Set last letter tile to the tile of the last letter from the message
    // This way we can set the current node to the leaf with the lasted added letter.
    if(!lastLetterTile){
      const lastLetter = message[message.length-1];
      const node = board.hasLetter(lastLetter);
      if(node){
        lastLetterTile = board.tiles.asFlatArray().filter((t) => t.n===node && t.p === 'A')[0];
      }
    }
    return lastLetterTile;
}

/**
 * @type {String} recordOfLetters is the variable that keeps track of what letters 
 *                                the user had typed in the message, and it what order.
 *                                The order can change if the use wants to swap the letters in the tree.
 */
let recordOfLetters = '';
function recordLettersAdded(letter){
  if(recordOfLetters.indexOf(letter) === -1){
    recordOfLetters += letter;
  }
}

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

function setUpFromUrl(){
  const params = queryParams();
  if(params && params.letters && params.letters[0] && params.encodedmessage && params.encodedmessage[0]){
    recordOfLetters = params.letters[0];
    const encodedmessage = params.encodedmessage[0];
    treeBuilder.buildFromLetterString(recordOfLetters);
    console.log(encodedmessage)
    const message = board.decodeMessage(encodedmessage).join('');
    console.log(message);
    $('#message').val(board.decodeMessage(encodedmessage).join(''));
    resetMessage(message);
  }
}

function resetMessage(message){
    message = message || $('#message').val();
    const code = board.encodeMessage(message.split('')).map((letter)=>letter.join('')).join(' ');
    $('#code').text(code);
    const encodedmessage = code.split(' ').join('');
    $('.bits-display').text(encodedmessage.length + ' ' || '0 ');
    try{
      window.history.replaceState({}, code, `writer.html?letters=${recordOfLetters}&encodedmessage=${encodedmessage}`);
    } catch(e){
      console.log(e);
    }
    $('a.share-a').attr('href', `decode.html?letters=${recordOfLetters}&encodedmessage=${encodedmessage}`);
}

/**
 * Swap letters in a string
 * @param {String} string The recordOfLetters
 * @param {String} letterA A letter to swap
 * @param {String} letterB Other letter to swap
 * @returns {String} a new string with the letters' positions swapped
 * @example swapLetters('abcde', 'c', 'e')
 * //=> 'abedc'
 */
function swapLetters(string, letterA, letterB){
  const newString = string.split('').map((l) => {
    if(l === letterA){
      return letterB;
    }
    else if(l === letterB){
      return letterA;
    }
    else{
      return l;
    }
  }).join('');
  return newString;
}

/**
 * Swaps letters in data and on screen.
 * @param {Tile} tileA 
 * @param {Tile} tileB 
 */
function handleSwap(tileA, tileB){
  board.swapLetters(tileA, tileB);
  board.setCurrNodeTile(tileB);
  repaint(board, {handleSwap: handleSwap});
  recordOfLetters = swapLetters(recordOfLetters, tileA.l, tileB.l);
  resetMessage();
}

const onReady = function(){
  // get tree and message from url
  setUpFromUrl();
  const audio = createAudioTags();
  repaint(board, {handleSwap: handleSwap});
  $('#message').on('input', function(){
    //createjs.Sound.play("drip");
    audio.drip.play();
    const message = $(this).val();
    const letterTile = updateTreeWithMessage(message);
    board.setCurrNodeTile(letterTile);
    repaint(board, {handleSwap: handleSwap});
    //repaint(board);
    resetMessage();
  });
  //try{
  //  createjs.Sound.registerSound({src:"app/media/sounds/75343__neotone__drip1.wav", id:"drip"});
  //}catch(e){
  //  console.log(e);
  //}
};

$(onReady);
