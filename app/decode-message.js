"use strict";
import "../vendor/jquery.js";
import "../vendor/bacon.js";

import LetterTree from "../letter-tree.js";
import TreeBuilder from "../tree-builder.js";
import { repaint } from "./html-tile-renderer.js";
import { createAudioTags } from "./sounds.js";

import jsonTree from "../data/tree-command-13x25.js";

let board;
let treeBuilder;
let sounds;

board = new LetterTree(jsonTree);
treeBuilder = new TreeBuilder(board, jsonTree.treeBuilder);

window.letterTree = board;

let lettersOnTree = "";
let encodedMessage = "";
let done = false;
let DIGITS = ["L", "R"];
let mistakeCounter = 0;

//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/21152762#21152762
function queryParams() {
  var qd = {};
  location.search
    .substring(1)
    .split("&")
    .forEach(function (item) {
      var s = item.split("="),
        k = s[0],
        v = s[1] && decodeURIComponent(s[1]);
      //(k in qd) ? qd[k].push(v) : qd[k] = [v]
      (qd[k] = qd[k] || []).push(v); //short-circuit
    });
  return qd;
}

function buildTreeFromLetters(letters, board, treeBuilder) {
  treeBuilder.buildFromLetterString(letters);
}

function leafCheck() {
  const leaf = isLeaf();
  if (leaf) {
    handleAtLeaf(leaf);
    return leaf;
  } else {
    return false;
  }
}

function isLeaf() {
  const tile = board.getCurrTile();
  if (tile.p === "A") {
    return tile;
  } else {
    return false;
  }
}
function isDone() {
  if (bitProgressCounter >= encodedMessage.length) {
    done = true;
    // $('body').addClass('done');
    $(".decoded-letter").addClass("done");
  }
  return done;
}

function lightUpLeaf(node) {
  console.log("light up leaf");
  let leafTiles = board.tiles.asFlatArray().filter((t) => t.n === node);
  let leafDivs = leafTiles.map((leaf) =>
    $(`[data-row=${leaf.row}][data-col=${leaf.col}] .pipe-tile`)
  );
  window.setTimeout(function () {
    leafDivs.forEach((div) => div.addClass("pipe-red"));
    let alphaDiv = leafDivs.pop();
    window.setTimeout(function () {
      leafDivs.forEach((div) => div.removeClass("pipe-red"));
      window.setTimeout(function () {
        alphaDiv.removeClass("pipe-red");
      }, 500);
    }, 300);
  }, 50);
}

function handleAtLeaf(leafTile) {
  console.log("handling leaf " + leafTile.l);
  const n = leafTile.n;
  const letter = leafTile.l;
  lightUpLeaf(leafTile.n);
  board.setCurrTileToRoot();
  sounds.drain.play();
  sounds.typewriter.play();
  const letterRepresentation = letter === " " ? "&nbsp;" : letter; // TODO: check for other punctuation
  const letterElm = $(
    `<div class="decoded-letter">${letterRepresentation}</div>`
  );
  // $('#decoded-message').append(letterElm).addClass('animated fadeInDownBig');
  letterElm.appendTo("#decoded-message").addClass("animated bounceInUp");
  $(".current-letter-bit-already-done")
    .removeClass("current-letter-bit-already-done")
    .addClass("bit-already-done");
  if (incorrectDepth === 0) {
    startOfCurrentLetter = bitProgressCounter;
  } else {
    console.log("bad letter");
    //reset depth, go back to start of current letter
    // TODO: DRY this up
    incorrectDepth = 0;
    console.log(bitProgressCounter);
    $(`[data-encoded-bit-index=${bitProgressCounter}]`).removeClass(
      "current-bit"
    );
    bitProgressCounter = startOfCurrentLetter;
    $(`[data-encoded-bit-index=${bitProgressCounter}]`).addClass("current-bit");
  }
  if (isDone()) {
    $(".make-your-own").addClass("show");
  }
  showGuide(encodedMessage[bitProgressCounter]);
}

let guideElm = null;
let showGuideCount = 0;
function showGuide(direction, message) {
  hideGuide();
  if (direction) {
    // message = message || 'press arrow key';
    message =
      showGuideCount < 5
        ? `<div class="hint-message desktop">press arrow key</div> <div class="hint-message mobile">press arrow button </div> `
        : "";
    const directionGlyph = { L: "⇦", R: "⇨", U: "⇧" }[direction];
    // const directionGlyph = {'L': '&larr;', 'R': '&rarr;', 'U': '&uarr;'}[direction];
    const currTile = board.getCurrTile();
    const pixelSize = 32;
    const currTileTop = currTile.row * pixelSize;
    const currTileLeft = currTile.col * pixelSize;
    const locationTop = `${currTileTop - 0 * pixelSize}px`;
    const locationLeft =
      direction === "L"
        ? `${currTileLeft - 1 * pixelSize}px`
        : `${currTileLeft + 1 * pixelSize}px`;
    const hintElm = $(
      `<div class="hint" style="top: ${locationTop}; left: ${locationLeft};">${message}<span class="hint-glyph">${directionGlyph}</span></div>`
    );
    guideElm = hintElm;
    $("#board .board-inner").append(hintElm);
    let animation = " pulse";
    if (direction === "L") animation = " slideInRight";
    if (direction === "R") animation = " slideInLeft";
    guideElm.addClass("animated " + animation);
    showGuideCount++;
  }
}

function hideGuide() {
  if (guideElm) {
    let guideElmToRemove = guideElm;
    window.setTimeout(() => guideElmToRemove.remove(), 500);
    // guideElm.remove();
    guideElm = null;
  }
}

function goLeft() {
  let isCorrect = checkEncodedBit("L");
  let leaf = null;
  // if(isCorrect){
  board.go("L");
  sounds.drip.play();
  leaf = leafCheck();
  // }
  if (isCorrect) {
    return "correct-L";
  } else if (leaf) {
    return "wrong-at-leaf";
  } else {
    return "wrong";
  }
}
function goRight() {
  let isCorrect = checkEncodedBit("R");
  let leaf = null;
  // if(isCorrect){
  board.go("R");
  sounds.drip.play();
  leaf = leafCheck();
  // }
  if (isCorrect) {
    return "correct-R";
  } else if (!isCorrect && leaf) {
    return "wrong-at-leaf";
  } else {
    return "wrong";
  }
}
function goUp() {
  let status = "correct";
  if (incorrectDepth > 0) {
    // if player has made a mistake previously...
    if (board.go("U") === 1) {
      // at root node start over
      console.log("restart at start of current letter");
      //roll back to last correct spot in code
      incorrectDepth = 0;
      $(`[data-encoded-bit-index=${bitProgressCounter}]`).removeClass(
        "current-bit"
      );
      bitProgressCounter = startOfCurrentLetter;
      $(`[data-encoded-bit-index=${bitProgressCounter}]`).addClass(
        "current-bit"
      );
      status = "correct";
    } else {
      incorrectDepth--;
      if (incorrectDepth > 0) {
        console.log("go up! " + incorrectDepth);
        status = "please-continue-up";
      }
      console.log("incorrectDepth: " + incorrectDepth);
    }
  } else {
    // do nothing if player hasn't made a mistake.
    // showGuide(encodedMessage[bitProgressCounter]);
    status = "correct";
  }
  return status;
}

function renderEncodedMessage(message) {
  let messageRoot = $("<div></div>");
  console.log(message);
  // https://stackoverflow.com/questions/24531751/how-can-i-split-a-string-containing-emoji-into-an-array
  message = [...message];
  console.log(message);
  for (let i = 0; i < message.length; i++) {
    console.log(message[i]);
    $(
      `<div class="encoded-bit" data-encoded-bit-index="${i}">${message[i]}</div>`
    ).appendTo(messageRoot);
  }
  return messageRoot;
}

let bitProgressCounter = 0;
let incorrectDepth = 0;
let startOfCurrentLetter = 0;
function checkEncodedBit(input) {
  if (input === encodedMessage[bitProgressCounter] && incorrectDepth === 0) {
    console.log("good!");
    $(`[data-encoded-bit-index=${bitProgressCounter}]`).removeClass(
      "current-bit"
    );
    $(`[data-encoded-bit-index=${bitProgressCounter}]`).addClass(
      "current-letter-bit-already-done"
    );
    bitProgressCounter++;
    $(`[data-encoded-bit-index=${bitProgressCounter}]`).addClass("current-bit");
    $(`[data-encoded-bit-index=${bitProgressCounter}]`).addClass(
      "animated bounce"
    );
    return true;
  } else {
    incorrectDepth++;
    return false;
  }
}

function afterMove(status) {
  if (
    status === "correct" ||
    status === "correct-L" ||
    status === "correct-R"
  ) {
    console.log("is correct ...." + status);
    if (status === "correct-L" && guideElm) {
      guideElm.addClass("animated flipOutX");
    } else if (status === "correct-R" && guideElm) {
      guideElm.addClass("animated flipOutX");
    }
    showGuide(encodedMessage[bitProgressCounter]);
  } else if (status === "wrong-at-leaf") {
    console.log("status: wrong at leaf");
    $("#board").addClass("animated shake");
    window.setTimeout(function () {
      $("#board").removeClass("animated shake");
    }, 500);
    showGuide(encodedMessage[bitProgressCounter]);
    mistakeCounter++;
    console.log("mistakes: ", mistakeCounter);
    $("#mistake-counter").text(mistakeCounter);
    $(".mistake-counter-label").show();
  } else if (status === "wrong") {
    console.log("status: wrong");
    $("#board").addClass("animated shake");
    window.setTimeout(function () {
      $("#board").removeClass("animated shake");
    }, 1000);
    showGuide("U");
  } else if ("please-continue-up") {
    console.log("status: please continue up");
    showGuide("U");
  }
}

// DIGITS will come in as 01
// function handleEmojiInput(origEncodedMessage, DIGITS) {
//   const emojiMessage = convertDigits(origEncodedMessage, ["0", "1"], DIGITS);
//   const encodedMessage = convertDigits(origEncodedMessage, ["0", "1"], ["L", "R"]);
//   const encodedMessageElm = renderEncodedMessage(emojiMessage);
//   $(encodedMessageElm).appendTo("#encoded-message");
// }

function onReady() {
  $(".mistake-counter-label").hide();
  sounds = createAudioTags();
  const params = queryParams();
  lettersOnTree = params.letters[0];
  const origEncodedMessage = params.encodedmessage[0];
  DIGITS = [...params.digits[0]]; // split unicode chars
  $("#left-digit-in-instructions").text(DIGITS[0]);
  $("#right-digit-in-instructions").text(DIGITS[1]);
  // if(DIGITS[0] === "👾"){
  //   handleEmojiInput(origEncodedMessage, DIGITS);
  // }
  encodedMessage = convertDigits(origEncodedMessage, DIGITS, ["L", "R"])
  const encodedMessageElm = renderEncodedMessage(origEncodedMessage);
  $(encodedMessageElm).appendTo("#encoded-message");
  buildTreeFromLetters(lettersOnTree, board, treeBuilder);
  repaint(board);
  $("[data-encoded-bit-index=0]").addClass("current-bit");

  // http://stackoverflow.com/questions/1402698/binding-arrow-keys-in-js-jquery
  $(document).keydown(function (e) {
    let status = "no-move";
    switch (e.which) {
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

      default:
        return; // exit this handler for other keys
    }
    repaint(board);
    afterMove(status);
    e.preventDefault(); // prevent the default action (scroll / move caret)
  });
  showGuide(encodedMessage[bitProgressCounter]);
  createMoveButton();
}

const createMoveButton = () => {
  console.log("create move button");
  const leftButton = $(
    '<div class="move-button left-move mobile" style="width: 100px; height: 100px; position:fixed; top:88%; left:2%; z-index:9999"> <span class="hint-glyph">⇦</span></div>'
  );
  const rightButton = $(
    '<div class="move-button right-move mobile" style="width: 100px; height: 100px; position:fixed; top:88%; right:0%; z-index:9999"> <span class="hint-glyph">⇨ </span></div>'
  );
  const upButton = $(
    '<div class="move-button up-move mobile" style="width: 100px; height: 100px; position:fixed; top:88%; left:40%; z-index:9999"> <span class="hint-glyph">⇧ </span></div>'
  );
  $(".message-container").append(leftButton);
  $(".message-container").append(rightButton);
  $(".message-container").append(upButton);
  // let plus = leftButton.asEventStream("click").map(1)
  let goLeft$ = Bacon.fromEvent(leftButton[0], "touchstart").map(() => "L");
  // goLeft$.onValue(function(val) { console.log('clicked '+ val); })
  let goRight$ = Bacon.fromEvent(rightButton[0], "touchstart").map(() => "R");
  // goRight$.onValue(function(val) { console.log('clicked '+ val); })
  let goUp$ = Bacon.fromEvent(upButton[0], "touchstart").map(() => "U");
  goUp$.onValue(function (val) { console.log('clicked ' + val); })
  let go$ = Bacon.mergeAll(goLeft$, goRight$, goUp$);
  go$.onValue((val) => {
    console.log(val);
  });
  go$.onValue((val) => {
    let status;
    if (val === "R") {
      status = goRight();
    } else if (val === "L") {
      status = goLeft();
    } else if (val === "U") {
      status = goUp();
      console.log(status)
    }
    repaint(board);
    afterMove(status);
  });
};

function convertDigits(encodedMessage, fromDigits, toDigits) {
  const chars = [...encodedMessage]; // for unicode emoji
  const recodedMessage = [];
  for (const c of chars) {
    if (c === fromDigits[0]) {
      recodedMessage.push(toDigits[0]);
    } else if (c === fromDigits[1]) {
      recodedMessage.push(toDigits[1]);
    } else {
      console.log(`Error decoding digit: ${c}`);
    }
  }
  return recodedMessage.join("");
}

$(onReady);
