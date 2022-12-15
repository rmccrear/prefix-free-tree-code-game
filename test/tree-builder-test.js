"use strict";

import { assert } from "chai";

import LetterTree from "../letter-tree.js";
import TreeBuilder from "../tree-builder.js";
import TileTextRenderer from "../tile-text-renderer.js";

import treeCommand13x25 from "../data/tree-command-13x25.js";
import _ from "lodash";

var equal = assert.equal;

const treeBuilderCommands = [
  { command: "goto", pos: { row: 2, col: 8 } },
  "D",
  "]",
  "D",
  "]",
  "D",
  "]",
  "D", // RRR
  "[",
  "D",
  "[",
  "D",
  "[",
  "D",
  "[",
  "D", // LLLL
  { command: "goto", pos: { row: 2, col: 2 } },
  "D",
  "[",
  "D", // L
  "]",
  "D",
  "]",
  "D",
  "]",
  "D",
  "]",
  "D", // RRRR
  "[",
  "D",
  "[",
  "D", // LL
  { command: "offsetBy", offset: { row: 8, col: 0 } },
];

const containsTile = function (tilesInBranch, tileLoc) {
  return tilesInBranch
    .map((t) => t.col === tileLoc.col && t.row === tileLoc.row)
    .includes(true);
};

describe("TreeBuilder", function () {
  let board;
  let treeBuilder;
  let Printer;
  beforeEach(function () {
    let input = _.cloneDeep(treeCommand13x25);
    board = new LetterTree(input);
    treeBuilder = new TreeBuilder(board, input.treeBuilder);
    Printer = TileTextRenderer;
  });
  describe("build out one command ", function () {
    it("should initialize", function () {
      assert.equal(
        board.tiles.tiles.length,
        25,
        "there should be 25 rows in tree-command-13-25.json"
      );
    });
    it("should branch one leaf", function () {
      const aBefore = { row: 2, col: 8 };
      equal(
        board.tiles.tiles[aBefore.row][aBefore.col].p,
        "A",
        "tree before changes"
      );
      treeBuilder.insertLetter("a");
      treeBuilder.insertLetter("b");
      equal(
        board.tiles.tiles[aBefore.row][aBefore.col].p,
        "A",
        "tree after intermediate changes"
      );
      equal(
        board.tiles.tiles[aBefore.row][aBefore.col].l,
        "b",
        "tree letter after intermediate changes"
      );

      treeBuilder.insertLetter("c");
      equal(board.tiles.tiles[aBefore.row][aBefore.col].p, "T");
      equal(board.tiles.tiles[aBefore.row][aBefore.col - 1].p, "L");
      equal(board.tiles.tiles[aBefore.row][aBefore.col + 1].p, "R");
      equal(
        board.tiles.tiles[aBefore.row + 1][aBefore.col - 1].p,
        "A",
        "after changes"
      );
      equal(
        board.tiles.tiles[aBefore.row + 1][aBefore.col + 1].p,
        "A",
        "after changes"
      );
    });
    it("should branch two leaves", function () {
      const aBefore = { row: 2, col: 8 };
      equal(board.tiles.tiles[aBefore.row][aBefore.col].p, "A");
      treeBuilder.insertLetter("a");
      treeBuilder.insertLetter("b");
      treeBuilder.insertLetter("c");
      treeBuilder.insertLetter("d");
      equal(board.tiles.tiles[aBefore.row][aBefore.col].p, "T");
      equal(board.tiles.tiles[aBefore.row][aBefore.col + 1].p, "R");
      equal(board.tiles.tiles[aBefore.row][aBefore.col - 1].p, "L");
      equal(board.tiles.tiles[aBefore.row + 1][aBefore.col - 1].p, "A");
      equal(board.tiles.tiles[aBefore.row + 1][aBefore.col + 1].p, "T"); // this is now a new branch
      equal(board.tiles.tiles[aBefore.row + 1][aBefore.col + 0].p, "L");
      equal(board.tiles.tiles[aBefore.row + 1][aBefore.col + 2].p, "R");
      equal(board.tiles.tiles[aBefore.row + 2][aBefore.col + 0].p, "A");
      equal(board.tiles.tiles[aBefore.row + 2][aBefore.col + 2].p, "A");
    });
  });
  describe("maintain currTile independent of board", function () {
    it("build and keep track of currTile, returning to currTile after moving it in board", function () {
      const aBefore = { row: 2, col: 8 };
      equal(board.tiles.tiles[aBefore.row][aBefore.col].p, "A");
      treeBuilder.insertLetter("a");
      board.setCurrNodeTile(aBefore);
      treeBuilder.insertLetter("b");
      board.setCurrNodeTile(aBefore);
      treeBuilder.insertLetter("c");
      board.setCurrNodeTile(aBefore);
      treeBuilder.insertLetter("d");
      equal(board.tiles.tiles[aBefore.row][aBefore.col].p, "T");
      equal(board.tiles.tiles[aBefore.row][aBefore.col + 1].p, "R");
      equal(board.tiles.tiles[aBefore.row][aBefore.col - 1].p, "L");
      equal(board.tiles.tiles[aBefore.row + 1][aBefore.col - 1].p, "A");
      equal(board.tiles.tiles[aBefore.row + 1][aBefore.col + 1].p, "T"); // this is now a new branch
      equal(board.tiles.tiles[aBefore.row + 1][aBefore.col + 0].p, "L");
      equal(board.tiles.tiles[aBefore.row + 1][aBefore.col + 2].p, "R");
      equal(board.tiles.tiles[aBefore.row + 2][aBefore.col + 0].p, "A");
      equal(board.tiles.tiles[aBefore.row + 2][aBefore.col + 2].p, "A");
    });
  });
  describe("build tree from letter string", function () {
    it("should initialize tree from file", function () {
      assert.equal(
        board.tiles.tiles.length,
        25,
        "there should be 25 rows in tree-command-13-25.json"
      );
    });
    it("should build out tree from string", function () {
      treeBuilder.buildFromLetterString("abcdefg");
      const aTile = { row: 2, col: 2 };
      const bTile = { row: 3, col: 7 };
      const cTile = { row: 4, col: 8 };
      const dTile = { row: 5, col: 9 };
      const eTile = { row: 7, col: 9 };
      const fTile = { row: 6, col: 12 };
      const gTile = { row: 7, col: 11 };
      equal(board.tiles.tiles[aTile.row][aTile.col].l, "a");
      equal(board.tiles.tiles[bTile.row][bTile.col].l, "b");
      equal(board.tiles.tiles[cTile.row][cTile.col].l, "c");
      equal(board.tiles.tiles[dTile.row][dTile.col].l, "d");
      equal(board.tiles.tiles[eTile.row][eTile.col].l, "e");
      equal(board.tiles.tiles[fTile.row][fTile.col].l, "f");
      equal(board.tiles.tiles[gTile.row][gTile.col].l, "g");
    });
  });
  describe("decoding/encoding a message", function () {
    it("should initialize board", function () {
      assert.equal(
        board.tiles.tiles.length,
        25,
        "there should be 25 rows in tree-command-13-25.json"
      );
      treeBuilder.buildFromLetterString("abcdefg");
      const gTile = { row: 7, col: 11 };
      equal(board.tiles.tiles[gTile.row][gTile.col].l, "g");
    });
    it("should encode a letter", function () {
      treeBuilder.buildFromLetterString("abcdefg");
      equal(board.encodeMessage(["a"])[0][0], "L");
      equal(board.encodeMessage(["b"])[0].join(""), "RL");
      equal(board.encodeMessage(["c"])[0].join(""), "RRL");

      // encodeMessage takes an array of letters, so split('')
      // it returns a nested array of encoded letters, so map each encoded letter to join('') them into a string
      // and then join(' ') the encoded letter to a string separated by spaces
      equal(
        board
          .encodeMessage("abacadaba".split(""))
          .map((letter) => letter.join(""))
          .join(" "),
        "L RL L RRL L RRRL L RL L"
      );
    });
    it("should decode a message", function () {
      treeBuilder.buildFromLetterString("abcdefg");
      equal(board.encodeMessage(["a"])[0][0], "L");
      equal(board.encodeMessage(["b"])[0].join(""), "RL");
      equal(board.encodeMessage(["c"])[0].join(""), "RRL");
      // equal(board.decodeMessage('LL'), 'aa');
      equal(board.decodeMessage("L").join(""), "a");
      equal(board.decodeMessage("LL").join(""), "aa");
      equal(board.decodeMessage("LLL").join(""), "aaa");
      equal(board.decodeMessage("LRL").join(""), "ab");
      equal(board.decodeMessage("LRLRRL").join(""), "abc");
    });
  });
  describe("build two iterations of branches", function () {
    it("should initialize", function () {
      assert.equal(
        board.tiles.tiles.length,
        25,
        "there should be 25 rows in tree-command-13-25.json"
      );
    });
  });
});
