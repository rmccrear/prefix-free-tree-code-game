"use strict";
import _ from "../vendor/underscore-esm.js";
import "../vendor/jquery.js";
import "../vendor/hammer.js";
import "../vendor/bacon.js";

import LetterTree from "../letter-tree.js";
import TreeBuilder from "../tree-builder.js";
import { repaint } from "./html-tile-renderer.js";
import { createAudioTags } from "./sounds.js";

import jsonTree from "../data/tree-command-13x25.js";

let INTERNAL_DIGITS = ["L", "R"];
let DIGITS = ["L", "R"];

const board = new LetterTree(jsonTree, INTERNAL_DIGITS);
const treeBuilder = new TreeBuilder(board, jsonTree.treeBuilder);

function updateTreeWithMessage(message) {
  let messageChars = _.uniq(message.split(""));
  let lastLetterTile;
  // remove dups
  messageChars.forEach((letter) => {
    lastLetterTile = treeBuilder.insertLetter(letter);
    recordLettersAdded(letter);
  });
  // Set last letter tile to the tile of the last letter from the message
  // This way we can set the current node to the leaf with the lasted added letter.
  if (!lastLetterTile) {
    const lastLetter = message[message.length - 1];
    const node = board.hasLetter(lastLetter);
    if (node) {
      lastLetterTile = board.tiles
        .asFlatArray()
        .filter((t) => t.n === node && t.p === "A")[0];
    }
  }
  return lastLetterTile;
}

/**
 * @type {String} recordOfLetters is the variable that keeps track of what letters
 *                                the user had typed in the message, and it what order.
 *                                The order can change if the use wants to swap the letters in the tree.
 */
let recordOfLetters = "";
let currentEncodedMessage = "";
let currentShareMessage = "";
function recordLettersAdded(letter) {
  if (recordOfLetters.indexOf(letter) === -1) {
    recordOfLetters += letter;
  }
}

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

function setUpFromUrl() {
  const params = queryParams();
  if (
    params &&
    params.digits &&
    params.digits[0] &&
    params.letters &&
    params.letters[0] &&
    params.encodedmessage &&
    params.encodedmessage[0]
  ) {
    DIGITS = [...params.digits[0]];
    recordOfLetters = params.letters[0];
    const externallyEncodedMessage = params.encodedmessage[0];
    const internallyEncodedMessage = convertDigits(externallyEncodedMessage, DIGITS, ["L", "R"]);
    // const encodedmessage = params.encodedmessage[0];
    treeBuilder.buildFromLetterString(recordOfLetters);
    const message = board.decodeMessage(internallyEncodedMessage).join("");
    console.log(message);
    $("#message").val(message);
    // $("#message").val(board.decodeMessage(encodedmessage).join(""));
    if(DIGITS[0] === "👾"){
      $("#code").addClass("super-shadow");
    } else {
      $("#code").removeClass("super-shadow");
    }
    resetMessage(message);
  }
}

function resetMessage(message) {
  message = message || $("#message").val();
  const code = board
    .encodeMessage(message.split(""))
    .map((letter) => letter.join(""))
    .join(" "); // add spaces
  const digitsStr = DIGITS[0] + DIGITS[1];
  const displayMessage = convertDigits(code, INTERNAL_DIGITS, DIGITS);
  const displayMessageNoSpaces = displayMessage.split(" ").join("");
  currentShareMessage = displayMessageNoSpaces;
  // $("#code").text(displayMessage);
  setupDisplay(code);
  const encodedmessage = code.split(" ").join(""); // remove spaces
  currentEncodedMessage = encodedmessage;
  const bitLength = currentEncodedMessage.length || 0;

  $(".bits-display").text(bitLength + " ");
  try {
    window.history.replaceState(
      {},
      code,
      `writer.html?digits=${digitsStr}&letters=${recordOfLetters}&encodedmessage=${displayMessageNoSpaces}`
    );
  } catch (e) {
    console.log(e);
  }
  $("a.share-a").attr(
    "href",
    `decode.html?digits=${digitsStr}&letters=${recordOfLetters}&encodedmessage=${displayMessageNoSpaces}`
  );
  resetCopyButtonText();
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
function swapLetters(string, letterA, letterB) {
  const newString = string
    .split("")
    .map((l) => {
      if (l === letterA) {
        return letterB;
      } else if (l === letterB) {
        return letterA;
      } else {
        return l;
      }
    })
    .join("");
  return newString;
}

/**
 * Swaps letters in data and on screen.
 * @param {Tile} tileA
 * @param {Tile} tileB
 */
function handleSwap(tileA, tileB) {
  board.swapLetters(tileA, tileB);
  board.setCurrNodeTile(tileB);
  repaint(board, { handleSwap: handleSwap });
  recordOfLetters = swapLetters(recordOfLetters, tileA.l, tileB.l);
  resetMessage();
}

const onReady = function () {
  // get tree and message from url
  setUpFromUrl();
  const audio = createAudioTags();
  repaint(board, { handleSwap: handleSwap });
  $("#message").on("input", function () {
    audio.drip.play();
    const message = $(this).val();
    const letterTile = updateTreeWithMessage(message);
    board.setCurrNodeTile(letterTile);
    repaint(board, { handleSwap: handleSwap });
    resetMessage();
  });
  $("#copy-link").on("click", function (event) {
    const href = window.location.href;
    let linkUrl = href.replace("writer.html", "decode.html")
    if(DIGITS[0] === "👾"){
      console.log("digit is alien!");
      console.log(currentShareMessage);
      linkUrl = `${location.protocol}//${location.host}${location.pathname}?digits=${DIGITS[0]}${DIGITS[1]}&letters=${encodeURIComponent(recordOfLetters)}&encodedmessage=${currentShareMessage}`
      console.log(linkUrl);
    }

    // copy to clipboard

    const shareData = {
      title: "Secret Message!",
      text: "This is your secret message. Decode it by following the link." + currentShareMessage,
      url: linkUrl,
    };

    if(navigator.share && navigator.canShare(shareData)) {
      navigator.share(shareData).then(() => {
        console.log("Shared successfully!");
      }).catch(console.error);
    }
    else {
      navigator.clipboard.writeText("Hi! I'm sending you a secret message. \n\n" + currentShareMessage + "\n\n Decode it by following the link. \n\n " + linkUrl).then(()=>{
        //set button text to "copied"
        $("#copy-link").text("copied!");
      });
    }
  });
  $(".digit-select").on("click", function(event) {
    const newDigits = $(this).data("digit");
    if(newDigits){
      changeDigitSystem([...newDigits])
    } else {
      console.log("Error changing new digit.");
    }
    // super-shadow for aliens!
    if(DIGITS[0] === "👾"){
      $("#code").addClass("super-shadow");
    } else {
      $("#code").removeClass("super-shadow");
    }
  });
  $("#code").on("click", function(event) {
    if(event.target && $(event.target).data("code")) {
      const code = $(event.target).data("code")
      console.log(code);
      const decodedTiles = board.decodeMessage(code, true);
      console.log(decodedTiles);
      if(decodedTiles) {
        $(".encoded-token").removeClass("highlight-token");
        $(event.target).addClass("highlight-token");
        // const letter = decodedTiles[0].l;
        const tile = decodedTiles[0];
        board.setCurrNodeTile(tile);
        repaint(board, { handleSwap: handleSwap });
      }
    } 
  });
};

const resetCopyButtonText = function(){
  $("#copy-link").text("share");
};

const changeDigitSystem = function(digits) {
  DIGITS = digits;
  resetMessage();
}

function setupDisplay(encodedMessageWithSpaces) {
  let tokens = encodedMessageWithSpaces.split(" ");
  let message = board.decodeMessage(tokens.join(""));
  let elms = [];
  for(let i=0; i<tokens.length; i++) {
    const internalCode = tokens[i];
    const encodedLetter = convertDigits(internalCode, INTERNAL_DIGITS, DIGITS);
    elms.push(`<span
      class="encoded-token"
      data-code="${internalCode}">${encodedLetter}<span class="code-popup"><span class="code-popup-letter">${message[i]}:</span>  ${encodedLetter}</span></span> `);
  }
  $("#code").html(elms.join(""));
}

function convertDigits(encodedMessage, fromDigits, toDigits) {
  const chars = [...encodedMessage]; // for unicode emoji
  const recodedMessage = [];
  for(const c of chars) {
    if(c === fromDigits[0]) {
      recodedMessage.push(toDigits[0]);
    } else if (c === fromDigits[1]) {
      recodedMessage.push(toDigits[1]);
    } else if (c === " ") { // allow space for tokens
      recodedMessage.push(c);
    }else {
      console.log(`Error decoding digit: ${c}`);
    }
  }
  return recodedMessage.join("");
}

$(onReady);
