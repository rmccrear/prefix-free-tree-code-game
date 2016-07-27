"use strict";

var LetterTree = require('../letter-tree.js');
var TileTextRenderer = require('../tile-text-renderer.js');

var jf = require('jsonfile');
var assert = require('chai').assert;
var equal = assert.equal;

const treeBuilderCommands = {
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
}

const containsTile = function(tilesInBranch, tileLoc){
  return tilesInBranch.map((t)=>t.col===tileLoc.col&&t.row===tileLoc.row).includes(true);
};

describe('TreeBuilder', function() {
  let board;
  let treeBuilder;
  let Printer;
  beforeEach(function(){
      const file = 'tree-command-13x25.json'
      let input = jf.readFileSync(file);
      board = new LetterTree(input);
      treeBuilder = new TreeBuilder(board, input.treeBuilder);
      Printer = TileTextRenderer;

  });
  describe('build out one command ', function(){
    it('should initialize', function(){
      assert.equal(board.tiles.tiles.length, 6, 'there should be 6 rows in tree-blank');
    });
    it('should branch one leaf', function(){
      const aBefore = {row: 1, col: 1};
      equal(board.tiles[aBefore.row][aBefore.col].p, 'A');
      treeBuilder.execute();
      equal(board.tiles[aBefore.row][aBefore.col].p, 'T');
      equal(board.tiles[aBefore.row][aBefore.col-1].p, 'L');
      equal(board.tiles[aBefore.row][aBefore.col+1].p, 'R');
      equal(board.tiles[aBefore.row-1][aBefore.col-1].p, 'A');
      equal(board.tiles[aBefore.row+1][aBefore.col+1].p, 'A');
    });
    it('should branch two leaves', function(){
      const aBefore = {row: 1, col: 1};
      equal(board.tiles[aBefore.row][aBefore.col].p, 'A');
      treeBuilder.execute();
      treeBuilder.execute();
      equal(board.tiles[aBefore.row][aBefore.col].p, 'T');
      equal(board.tiles[aBefore.row][aBefore.col+1].p, 'R');
      equal(board.tiles[aBefore.row][aBefore.col-1].p, 'L');
      equal(board.tiles[aBefore.row-1][aBefore.col-1].p, 'A');
      equal(board.tiles[aBefore.row+1][aBefore.col+1].p, 'T'); // this is now a new branch
      equal(board.tiles[aBefore.row+1][aBefore.col+0].p, 'L'); 
      equal(board.tiles[aBefore.row+1][aBefore.col+2].p, 'R'); 
      equal(board.tiles[aBefore.row+2][aBefore.col+0].p, 'A'); 
      equal(board.tiles[aBefore.row+2][aBefore.col+2].p, 'A'); 
    });
  });
  describe('build one branch', function(){
    it('should initialize', function(){
      assert.equal(board.tiles.tiles.length, 6, 'there should be 6 rows in tree-blank');
    });
  });
  describe('build two branches', function(){
    it('should initialize', function(){
      assert.equal(board.tiles.tiles.length, 6, 'there should be 6 rows in tree-blank');
    });
  });
  describe('build two iterations of branches', function(){
    it('should initialize', function(){
      assert.equal(board.tiles.tiles.length, 6, 'there should be 6 rows in tree-blank');
    });
  });
});
