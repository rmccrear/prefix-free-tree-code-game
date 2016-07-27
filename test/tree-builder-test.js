"use strict";

var LetterTree = require('../letter-tree.js');
var TreeBuilder = require('../tree-builder.js');
var TileTextRenderer = require('../tile-text-renderer.js');

var jf = require('jsonfile');
var assert = require('chai').assert;
var equal = assert.equal;

const treeBuilderCommands = 
  [
    {"command": "goto", "pos": {"row": 2, "col": 8}},
    "D",
    "]", "D", "]", "D", "]", "D",  // RRR
    "[", "D", "[", "D", "[", "D", "[", "D", // LLLL
    {"command": "goto", "pos": {"row": 2, "col": 2}},
    "D",
    "[", "D", // L
    "]", "D", "]", "D", "]", "D", "]", "D", // RRRR
    "[", "D", "[", "D", // LL
    {"command": "offsetBy", "offset": {"row": 8, "col": 0}}
  ]


const containsTile = function(tilesInBranch, tileLoc){
  return tilesInBranch.map((t)=>t.col===tileLoc.col&&t.row===tileLoc.row).includes(true);
};

describe('TreeBuilder', function() {
  let board;
  let treeBuilder;
  let Printer;
  beforeEach(function(){
      const file = 'data/tree-command-13x25.json';
      let input = jf.readFileSync(file);
      board = new LetterTree(input);
      treeBuilder = new TreeBuilder(board, input.treeBuilder);
      Printer = TileTextRenderer;

  });
  describe('build out one command ', function(){
    it('should initialize', function(){
      assert.equal(board.tiles.tiles.length, 25, 'there should be 25 rows in tree-command-13-25.json');
    });
    it('should branch one leaf', function(){
      const aBefore = {row: 2, col: 8};
      equal(board.tiles.tiles[aBefore.row][aBefore.col].p, 'A', 'tree before changes');
      treeBuilder.insertLetter('a');
      treeBuilder.insertLetter('b');
      equal(board.tiles.tiles[aBefore.row][aBefore.col].p, 'A', 'tree after intermediate changes');
      equal(board.tiles.tiles[aBefore.row][aBefore.col].l, 'b', 'tree letter after intermediate changes');

      treeBuilder.insertLetter('c');
      equal(board.tiles.tiles[aBefore.row][aBefore.col].p, 'T');
      equal(board.tiles.tiles[aBefore.row][aBefore.col-1].p, 'L');
      equal(board.tiles.tiles[aBefore.row][aBefore.col+1].p, 'R');
      equal(board.tiles.tiles[aBefore.row+1][aBefore.col-1].p, 'A', 'after changes');
      equal(board.tiles.tiles[aBefore.row+1][aBefore.col+1].p, 'A', 'after changes');
    });
    it('should branch two leaves', function(){
      const aBefore = {row: 2, col: 8};
      equal(board.tiles.tiles[aBefore.row][aBefore.col].p, 'A');
      treeBuilder.insertLetter('a');
      treeBuilder.insertLetter('b');
      treeBuilder.insertLetter('c');
      treeBuilder.insertLetter('d');
      equal(board.tiles.tiles[aBefore.row][aBefore.col].p, 'T');
      equal(board.tiles.tiles[aBefore.row][aBefore.col+1].p, 'R');
      equal(board.tiles.tiles[aBefore.row][aBefore.col-1].p, 'L');
      equal(board.tiles.tiles[aBefore.row+1][aBefore.col-1].p, 'A');
      equal(board.tiles.tiles[aBefore.row+1][aBefore.col+1].p, 'T'); // this is now a new branch
      equal(board.tiles.tiles[aBefore.row+1][aBefore.col+0].p, 'L'); 
      equal(board.tiles.tiles[aBefore.row+1][aBefore.col+2].p, 'R'); 
      equal(board.tiles.tiles[aBefore.row+2][aBefore.col+0].p, 'A'); 
      equal(board.tiles.tiles[aBefore.row+2][aBefore.col+2].p, 'A'); 
    });
  });
  describe('build one branch', function(){
    it('should initialize', function(){
      assert.equal(board.tiles.tiles.length, 25, 'there should be 25 rows in tree-command-13-25.json');
    });
  });
  describe('build two branches', function(){
    it('should initialize', function(){
      assert.equal(board.tiles.tiles.length, 25, 'there should be 25 rows in tree-command-13-25.json');
    });
  });
  describe('build two iterations of branches', function(){
    it('should initialize', function(){
      assert.equal(board.tiles.tiles.length, 25, 'there should be 25 rows in tree-command-13-25.json');
    });
  });
});
