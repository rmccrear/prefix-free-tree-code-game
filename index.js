#!/Users/robertmccreary/.nvm/versions/node/v4.4.7/bin/node --harmony_array_includes

"use strict";

const BinaryTree = require('./binary-tree.js');
const Tiles = require('./tiles.js');
const TilePrinter = require('./tile-text-renderer.js');
var program = require('commander');
var jf = require('jsonfile');
var prompt = require('prompt');
var chalk = require('chalk');


program
  .arguments('<file>')
  .action(function(file) {
      var board = jf.readFileSync(file);
      // var tree = new Tree(board)
      let tiles = new Tiles(board);
      TilePrinter.print(tiles.tiles);
  })
  .parse(process.argv);
