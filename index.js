#!/Users/robertmccreary/.nvm/versions/node/v4.4.7/bin/node --harmony_array_includes

"use strict";

// const BinaryTree = require('./binary-tree.js');
// const Tiles = require('./tiles.js');
const LetterTree = require('./letter-tree.js');
const TileTextRenderer = require('./tile-text-renderer.js');
const TreeBuilder = require('./tree-builder.js');
var program = require('commander');
var jf = require('jsonfile');
// var prompt = require('prompt');
var readline = require('readline-sync');
// var chalk = require('chalk');

let board;
let moveRecord;
let treeBuilder;
program
  .arguments('<file>')
  .option('-c, --create', 'Create tree')
  .option('-w, --write', 'Write a message')
  .action(function(file) {
      let json;
      json = jf.readFileSync(file);
      // var tree = new Tree(board)
      // let tiles = new Tiles(board);
      board = new LetterTree(json);
      treeBuilder = new TreeBuilder(board, json.treeBuilder);
      moveRecord = json.moveRecord;
      TileTextRenderer.print(board);
  })
  .parse(process.argv);

const nav = {
  'L': {row: 0,  col: -1},
  'R': {row: 0,  col:  1},
  'U': {row: -1, col:  0},
  'D': {row: 1,  col:  0}
};

function navigationCommand (board, command){
  const response = command;
  let currTile = board.tiles.tiles[board.currTile.row][board.currTile.col];
      if(['L', 'R', 'D', 'U'].includes(response)){
        
        const move = nav[response];
        const R = board.currTile.row + move.row;
        const C = board.currTile.col + move.col;
        //
        // only move on tree
        if(R < board.tiles.dim.rows && C < board.tiles.dim.cols  && board.tiles.tiles[R][C].n){
          board.currTile.row = R;
          board.currTile.col = C;
        }
        else if(board.tiles.tiles[board.currTile.row][board.currTile.col].p === 'A' && response==='D'){
          // create a new branch here.
          board.branchOut(board.tiles.tiles[board.currTile.row][board.currTile.col]);
        }
        else{
          console.log('out of bounds ' + board.tiles.tiles[R][C].p);
        }

      }
      else if(response === '>'){
        board.tiles.expandGrid('R');
      }
      else if(response === '<'){
        board.tiles.expandGrid('L');
      }
      else if(response === '.'){
        board.tiles.expandGrid('D');
      }
      else if(response === '}'){
        board.tiles.moveAllTiles('R');
      }
      else if(response === '{'){
        board.tiles.moveAllTiles('L');
      }
      else if(response === '['){
        board.go('L');
      }
      else if(response === ']'){
        board.go('R');
      }
      else if(response === '='){
        board.go('U');
      }
      else if(response === response.toLowerCase() && currTile.p === 'A'){
        // add a character to the 
        currTile.l = response;
      }
}

// if the node has a child that is a leaf, return it
function getChildLeafNodesOf(board, node){
  const children = board.tree.graph[node];
  let childLeaves = [];
  const leftNodesChildren = board.tree.graph[children[0]];
  const rightNodesChildren = board.tree.graph[children[1]];
  if(leftNodesChildren.length === 0){
    childLeaves.push(children[0]);
  }
  if(rightNodesChildren.length === 0){
    childLeaves.push(children[1]);
  }
  return childLeaves;
}

function encodeMessage(board, message){
  const letterTiles = board.tiles.asFlatArray((t)=>t.p==='A' && t.l);
  const letterMapArr = letterTiles.map((t) => [t.l, board.tree.encodingOf(t.n)]);
  const letterMap = new Map(letterMapArr);
  return message.map((letter)=>letterMap.get(letter).join('')).join(' ');
}


if (program.write){
  let running = true;
  let count = 1;
  let message = []
  while(running){
    const response = readline.keyIn('MESSAGE: ' + message.join('') + '\n#' +  count + ' currently at: row: ' + board.currTile.row + ', col: ' + board.currTile.col + `(${board.getCurrTile().p})` +' >>>>>>>>>>>> Type message >>>>>>>>>>>>>>>>>>');
    message.push(response);
    let currTile ;
      // const command = moveRecord.shift();

    if(response === 'Q'){
      running = false;
    }
      currTile = board.getCurrTile();
      // now insert letter
    // treeBuilder.nextBuildOut();
    //board.setLetterInFirstEmptyLeaf(response);
    treeBuilder.insertLetter(response);
    console.log(encodeMessage(board, message));
    TileTextRenderer.print(board);
  }
}

if (program.create) {
  let running = true;
  let count = 1;
  let moveRecord = [];
  while(running){
    // const response = readline.question('>>');
    console.log(' ');
    const response = readline.keyIn('#' +  count + ' currently at: row: ' + board.getCurrTile.row + ', col: ' + board.getCurrTile.col + `(${board.getCurrTile().p})` +' >>>>>>>>>>>> Type L R U D or Q >>>>>>>>>>>>>>>>>>');
    count++;
    const currTile = board.getCurrTile();
    if(response === 'Q'){
      let output = board.toJSON();
      output.moveRecord = moveRecord;
      console.log(JSON.stringify(output));
      running = false;
    }
    else{
      navigationCommand(board, response);
      // if(['L', 'R', 'D', 'U'].includes(response)){
      //   console.log('move ' + response);
        
      //   const move = nav[response];
      //   const R = board.currTile.row + move.row;
      //   const C = board.currTile.col + move.col;
      //   //
      //   // only move on tree
      //   if(R < board.tiles.dim.rows && C < board.tiles.dim.cols  && board.tiles.tiles[R][C].n){
      //     board.currTile.row = R;
      //     board.currTile.col = C;
      //   }
      //   else if(board.tiles.tiles[board.currTile.row][board.currTile.col].p === 'A' && response==='D'){
      //     // create a new branch here.
      //     board.branchOut(board.tiles.tiles[board.currTile.row][board.currTile.col]);
      //   }
      //   else{
      //     console.log('out of bounds ' + board.tiles.tiles[R][C].p)
      //   }

      // }
      // else if(response === '>'){
      //   board.tiles.expandGrid('R');
      // }
      // else if(response === '<'){
      //   board.tiles.expandGrid('L');
      // }
      // else if(response === '.'){
      //   board.tiles.expandGrid('D');
      // }
      // else if(response === '}'){
      //   board.tiles.moveAllTiles('R');
      // }
      // else if(response === '{'){
      //   board.tiles.moveAllTiles('L');
      // }
      // else if(response === '['){
      //   board.go('L');
      // }
      // else if(response === ']'){
      //   board.go('R');
      // }
      // else if(response === '='){
      //   board.go('U');
      // }
      // else if(response === response.toLowerCase() && currTile.p === 'A'){
      //   // add a character to the 
      //   currTile.l = response;
      // }
      moveRecord.push(response);
      TileTextRenderer.print(board);
    }
  }
}
