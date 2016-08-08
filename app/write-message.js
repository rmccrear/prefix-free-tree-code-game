"use strict";

const $ = require('jquery');
const _ = require('lodash');

const LetterTree = require('../letter-tree.js');
const TreeBuilder = require('../tree-builder.js');

const jsonTree = require('../data/tree-command-13x25.json');
const repaint = require('./html-tile-renderer.js').repaint;


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
    messageChars.forEach((letter) => {
      lastLetterTile = treeBuilder.insertLetter(letter);
      recordLettersAdded(letter);
    });
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

function generateShareUrl(){
  const params = queryParams();
  const lettersOnTree = params.letters[0];
  const encodedMessage = params.encodedmessage[0];
  return `http://localhost:22222/decode.html?letters=${lettersOnTree}&encodedmessage=${encodedMessage}`;
}
window.generateShareUrl = generateShareUrl;

function setUpFromUrl(){
  const params = queryParams();
  if(params && params.letters && params.letters[0] && params.encodedmessage && params.encodedmessage[0]){
    recordOfLetters = params.letters[0];
    const encodedmessage = params.encodedmessage[0];
    treeBuilder.buildFromLetterString(recordOfLetters);
    $('#message').val(board.decodeMessage(encodedmessage).join(''));
    $('a.share-a').attr('href', `decode.html?letters=${recordOfLetters}&encodedmessage=${encodedmessage}`);
  }
}

const onReady = function(){
  try{
    createjs.Sound.registerSound({src:"app/media/sounds/75343__neotone__drip1.wav", id:"drip"});
  }catch(e){
    console.log(e);
  }
  // get tree and message from url
  setUpFromUrl();
  repaint(board);
  $('#message').on('input', function(){
    createjs.Sound.play("drip");
    const message = $(this).val();
    const letterTile = updateTreeWithMessage(message);
    board.setCurrNodeTile(letterTile);
    const code = board.encodeMessage(message.split('')).map((letter)=>letter.join('')).join(' ');
    $('#code').text(code);
    repaint(board);
    const encodedmessage = code.split(' ').join('');
    try{
    window.history.pushState({}, code, `writer.html?letters=${recordOfLetters}&encodedmessage=${encodedmessage}`);
    } catch(e){
      console.log(e);
    }
    $('a.share-a').attr('href', `decode.html?letters=${recordOfLetters}&encodedmessage=${encodedmessage}`);
  });
};

$(onReady);
