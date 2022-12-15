"use strict";

import LetterTree from "../letter-tree.js";
import TileTextRenderer from "../tile-text-renderer.js";
import treeBlank from "./data/tree-blank.js";
import treeScaffold13x25 from "../data/tree-scaffold-13x25.js";
import _ from "lodash";

import { assert } from "chai";

const containsTile = function (tilesInBranch, tileLoc) {
  return tilesInBranch
    .map((t) => t.col === tileLoc.col && t.row === tileLoc.row)
    .includes(true);
};

describe("LetterTree", function () {
  let board;
  let Printer;
  beforeEach(function () {
    const input = _.cloneDeep(treeBlank);
    board = new LetterTree(input);
    Printer = TileTextRenderer;
  });
  describe("add a branch", function () {
    it("should initialize", function () {
      assert.equal(
        board.tiles.tiles.length,
        6,
        "there should be 6 rows in tree-blank"
      );
    });

    it("should add a node", function () {
      let node1 = 1;
      // get the letter tile for node 1
      let letterTile1 = board.tiles
        .asFlatArray()
        .filter((t) => t.n === node1 && t.p === "A")
        .pop();
      const newTiles = board.branchOut(letterTile1);
      assert.equal(newTiles.length, 4);
      assert.equal(letterTile1.p, "T");
      assert.equal(board.tiles.tiles[1][1].p, "L");
      assert.equal(board.tiles.tiles[1][1].n, 2);
      assert.equal(board.tiles.tiles[1][3].p, "R");
      assert.equal(board.tiles.tiles[1][3].n, 3);

      assert.equal(board.tiles.tiles[2][1].p, "A");
      assert.equal(board.tiles.tiles[2][1].n, 2);
      assert.equal(board.tiles.tiles[2][3].p, "A");
      assert.equal(board.tiles.tiles[2][3].n, 3);
    });

    it(" should add two branches", function () {
      let node1 = 1;
      let letterTile1 = board.tiles
        .asFlatArray()
        .filter((t) => t.n === node1 && t.p === "A")
        .pop();
      const newTiles = board.branchOut(letterTile1);
      assert.equal(newTiles.length, 4);
      assert.equal(board.tiles.tiles[2][3].p, "A");
      assert.equal(board.tiles.tiles[2][3].n, 3);

      let letterTile3 = board.tiles.tiles[2][3];
      const newTiles3 = board.branchOut(letterTile3);
      assert.equal(newTiles3.length, 4);
      assert.equal(letterTile3.p, "T");
      assert.equal(board.tiles.tiles[2][2].p, "L");
      assert.equal(board.tiles.tiles[2][2].n, 4, "Left one");
      assert.equal(board.tiles.tiles[2][4].p, "R");
      assert.equal(board.tiles.tiles[2][4].n, 5, "Right one");

      assert.equal(board.tiles.tiles[3][2].p, "A");
      assert.equal(board.tiles.tiles[3][2].n, 4, "Left alpha node");
      assert.equal(board.tiles.tiles[3][4].p, "A");
      assert.equal(board.tiles.tiles[3][4].n, 5, "Right alpha node");
    });
    it("should detect if there is a conflict and move tiles to resolve it", function () {
      let node1 = 1;
      let letterTile1 = board.tiles
        .asFlatArray()
        .filter((t) => t.n === node1 && t.p === "A")
        .pop();
      const newTiles = board.branchOut(letterTile1);
      assert.equal(newTiles.length, 4);
      assert.equal(board.tiles.tiles[2][3].p, "A");
      assert.equal(board.tiles.tiles[2][3].n, 3);

      let letterTile3 = board.tiles.tiles[2][3];
      const newTiles3 = board.branchOut(letterTile3);
      assert.equal(newTiles3.length, 4);
      assert.equal(letterTile3.p, "T");
      assert.equal(board.tiles.tiles[2][2].p, "L"); // conflict
      assert.equal(board.tiles.tiles[2][2].n, 4, "Left one");
      assert.equal(board.tiles.tiles[3][2].p, "A"); // conflict
      assert.equal(board.tiles.tiles[3][2].n, 4, "Left alpha node");

      let letterTile2 = board.tiles.tiles[2][1];
      const newTiles2 = board.branchOut(letterTile2);
      assert.equal(newTiles2.length, 4);
    });
  });
});

describe("move around", function () {
  let boardScaffold;
  beforeEach(function () {
    const input = _.cloneDeep(treeScaffold13x25);
    boardScaffold = new LetterTree(input);
  });
  describe("movement", function () {
    it("should move", function () {
      assert.equal(boardScaffold.currTile.row, 0);
      boardScaffold.go("L");
    });
  });
});
