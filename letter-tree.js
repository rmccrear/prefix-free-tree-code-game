"use strict";
import BinaryTree from "./binary-tree.js";
import Tiles from "./tiles.js";
//const BinaryTree = require('./binary-tree.js');
//const Tiles = require('./tiles.js');

const moveNav = {
  L: 0,
  R: 1,
};

/**
 * Letter Tree has two parts. One is a graph of a binary tree.
 * The other is the 2d representation (Tiles)
 * (Tiles also contains the letter at each leaf.)
 * It keeps track of the structure of the tree using graph.
 * It keeps track of the layout on the screen of the graph using tiles.
 * It also keeps track of the letters used by storing the letters in a Tile (as tile.l).
 *
 * Tiles' JSON representation looks like this:
 * {"p":"E","n":0,"row":0,"col":0}
 *
 * There are different kinds of tiles, stored in the value for tile.p
 * {p: "E"} is an empty tile
 * {p: "T"} is a T shaped pipe like this ┻;
 * {p: "A"} is an Alpha tile and is the leaf which can contain a letter value.
 *
 * The tiles can fit together like this:
 * 'E': ' ',
 * 'T': '┻',
 * 'R': '┓',
 * 'L': '┏',
 * 'A': '╍',
 * 'H': '─',
 * 'V': '┃'
 *
 *  0123456789
 * 0    ┃
 * 1 ┏──┻──┓
 * 2 A     ┃
 * 3     ┏─┻─┓
 * 4     B   C
 *
 * The tree.graph would look like this:
 * tree.graph=[[],[2,3],[],[4,5],[],[]]
 * Where tree.graph[1] is the root, tree.graph[2] is the node that contains 'A', tree.graph[4] has 'B', and tree.graph[5] has 'C'
 *
 * The tiles for this LetterTree would be a 10x10 array. The Apha nodes would look like this:
 * And the letters are stored in the tile.l value
 * {p: "A", col: "1", row: "2", n: 2, l: "A"}  // tree.graph[2] has letter A
 * {p: "A", col: "5", row: "4", n: 4, l: "B"}  // tree.graph[4] has letter B
 * {p: "A", col: "9", row: "4", n: 5, l: "C"}  // tree.graph[5] has letter C
 *
 * The node 2 also has some associated L and H tiles because they are part of its edge:
 * And these tiles don't have values for "l"
 * {p: "L", col: "1", row: "1", n: 1}
 * {p: "H", col: "2", row: "1", n: 1}
 *
 *
 * The LetterTree keeps track of a current tile so we can navigate around the tree.
 */

class LetterTree {
  /**
   *
   * @param {Object} input  input.graph [[],[2,3],[],[]]
   *                        input.tiles [[{"p":"E","n":0,"row":0,"col":0}, ...}
   */
  constructor(input) {
    /**
     * The graph/tree
     */
    this.tree = new BinaryTree(input); // requires input.graph to be present
    /**
     * The screen and letter data
     */
    this.tiles = new Tiles(input);
    this.currNode = 1;
    this.rootNodeTile = this.findTilesForNode(this.currNode)[0];
    this.currTile = this.rootNodeTile; // should start at tree root
  }

  setCurrTileToRoot() {
    this.currTile = this.rootNodeTile; // should be tree root
  }

  getCurrTile() {
    return this.tiles.tiles[this.currTile.row][this.currTile.col];
  }

  setCurrNodeTile(tile) {
    const cTile = this.tiles.tiles[tile.row][tile.col];
    this.currNode = cTile.n;
    this.currTile = cTile;
  }

  /**
   * Find the tiles on a board associated with the node in a graph.
   * In order to, for example, highlight them with a certain color.
   * @param {Number} nodeId The node in the graph
   *
   */
  findTilesForNode(nodeId) {
    return this.tiles.tiles
      .reduce((a, b) => a.concat(b)) // flatten
      .filter((t) => t.n === nodeId);
  }

  /**
   * Swap values of letters in the tiles
   * @param {Location} locA Location of tile to swap
   * @param {Location} locB Location of other tile to swap
   */
  swapLetters(locA, locB) {
    let tileA = this.tiles.tiles[locA.row][locA.col];
    let tileB = this.tiles.tiles[locB.row][locB.col];
    const letterA = tileA.l;
    const letterB = tileB.l;
    tileA.l = letterB;
    tileB.l = letterA;
  }

  // move to T fork or leaf
  /**
   * Move the current tile along a path on the tree
   * @param {String} direction one of 'L' 'R' 'U' 'D' (Left, Right, Up, Down)
   */
  go(direction) {
    const currNodeId = this.currTile.n;
    let nextNodeId;
    if (direction === "L" || direction === "R") {
      nextNodeId = this.tree.graph[currNodeId][moveNav[direction]];
    } else if (direction === "U") {
      nextNodeId = this.tree.parentOf(currNodeId);
    }
    const nextTerminalTileArr = this.tiles
      .asFlatArray()
      .filter((t) => t.n === nextNodeId && (t.p === "T" || t.p === "A"));

    if (nextTerminalTileArr.length > 0) {
      this.currTile = nextTerminalTileArr[0];
    }
    return nextNodeId;
  }

  /**
   * Branch a leaf into two leafs, being careful not to cover up other nodes on the board.
   * @param {Tile} tile
   */
  branchOut(tile) {
    const nodeId = tile.n;
    const newLeaves = this.tree.branchOut(nodeId);
    let leafTiles = [
      this.tiles.createEmptyTile({ row: tile.row, col: tile.col - 1 }),
      this.tiles.createEmptyTile({ row: tile.row + 1, col: tile.col - 1 }),
      this.tiles.createEmptyTile({ row: tile.row, col: tile.col + 1 }),
      this.tiles.createEmptyTile({ row: tile.row + 1, col: tile.col + 1 }),
    ];
    leafTiles[0].p = "L";
    leafTiles[1].p = "A";
    leafTiles[1].l = tile.l; // transfer letter over
    leafTiles[2].p = "R";
    leafTiles[3].p = "A";

    let conflicts = [];

    // check dimensions of board
    leafTiles.forEach(function (t) {
      if (t.row >= this.tiles.dim.rows) {
        this.tiles.expandGrid("D");
      }
      if (t.col >= this.tiles.dim.cols) {
        this.tiles.expandGrid("R");
      }
      if (t.col < 0) {
        this.tiles.expandGrid("L");
        // move new tiles over
        leafTiles.forEach((tt) => tt.col++);
      }
    }, this);

    if (newLeaves.length > 0) {
      tile.p = "T";
      tile.l = ""; // remove l from old alpha node, which is now a T node
      leafTiles[0].n = newLeaves[0]; // These tiles belong to one new node
      leafTiles[1].n = newLeaves[0];
      leafTiles[2].n = newLeaves[1]; // These tiles belong to the other new node
      leafTiles[3].n = newLeaves[1];
      // new we can insert them
      // first check for conflicts
      conflicts = this.tiles.detectConflicts(leafTiles);
      // while(conflicts.length > 0){
      //   // move things about
      //   console.log(leafTiles)
      //   console.log(conflicts)
      //   this.resolveTileConflicts(conflicts);
      //   conflicts = this.tiles.detectConflicts(leafTiles);
      // }
      if (conflicts.length === 0) {
        // insert into tiles
        leafTiles.forEach(function (leaf) {
          const r = leaf.row;
          const c = leaf.col;
          this.tiles.tiles[r][c] = leaf;
        }, this);
      }
    }
    return leafTiles;
  }

  // Its better just to use a pre-build tree structure for the website
  // Allowing users to create a new tree structure makes the game too confusing.
  // resolveTileConflicts(conflicts){
  //       console.log(conflicts)
  //       // find common ancestor
  //       // find right node of common node
  //       // move right node's branch over
  //       // add a H node to the empty space to the right of the common ancestor's T tile
  //       // check if there are still conflicts

  //       // find common ancestor
  //       const conflict = conflicts.pop();
  //       const commonAncestor = this.tree.commonAncestorOf(tile.n, conflict.n);
  //       console.log(commonAncestor)
  //       const ancestorT = this.tiles.asFlatArray().filter((t)=>t.n===commonAncestor.n && t.p==='T');// T tile

  //       // find right node of common node
  //       const jointLocation = {row: ancestorT.row, col: ancestorT.col+1};
  //       const rightNodeOfAncestor = this.tree.graph[commonAncestor][1];
  //       const tilesToMove = this.branchTiles(rightNodeOfAncestor);

  //       // move right node's branch over
  //       this.tiles.moveTiles(tilesToMove, 'R');

  //       // add a H node to the empty space to the right of the common ancestor's T tile
  //       this.tiles.tiles[jointLocation.row][jointLocation.col] = this.tiles.emptyTile();
  //       this.tiles.tiles[jointLocation.row][jointLocation.col].n = rightNodeOfAncestor;
  //       this.tiles.tiles[jointLocation.row][jointLocation.col].p = 'H';
  // }

  /**
   * Find all tiles that are in the branch leading to the leaf nodeId
   * (For the purpose of highlighting the branch on the board)
   * @param {Number} nodeId The index of the leaf (in the graph)
   * @returns {Array} an array of Tiles that are associated with the path
   */
  branchTiles(nodeId) {
    const branch = this.tree.branchOf(nodeId);
    return this.tiles
      .asFlatArray()
      .map((t) => t.n)
      .filter((n) => branch.includes(n));
  }

  toJSON() {
    return {
      graph: this.tree.graph,
      tiles: this.tiles.tiles,
    };
  }

  setLetter(nodeId, letter) {
    // find Alpha node with this nodeId
    const letterTileArr = this.tiles
      .asFlatArray()
      .filter((t) => t.n === nodeId && t.p === "A");
    if (letterTileArr.length > 0) {
      letterTileArr[0].l = letter;
    }
  }

  setLetterInFirstEmptyLeaf(letter) {
    // find all empty Alpha nodes
    const letterTileArr = this.tiles
      .asFlatArray()
      .filter(
        (t) => (typeof t.l === "undefined" || t.l === null) && t.p === "A"
      );
    if (letterTileArr.length > 0) {
      // pick first one.
      letterTileArr[0].l = letter;
      return letterTileArr[0];
    }
  }

  /**
   * Returns the nodeId of the letter if the letter has already been placed in the tree.
   * @param {string} letter
   * @returns {boolean} false if the tree already does not have the letter in it.
   */
  hasLetter(letter) {
    const letterTileArr = this.tiles
      .asFlatArray()
      .filter((t) => t.l === letter && t.p === "A");
    if (letterTileArr.length > 0) {
      return letterTileArr[0].n;
    } else {
      return false;
    }
  }

  /**
   * Uses the tree to encode your message.
   * @param {String} message A message to encode
   * @param {Array} encodedMessage An array where each letters has been mapped to its encoding based on the path of the leaf in the tree.
   */
  encodeMessage(message) {
    // find all letter tiles
    const letterTiles = this.tiles
      .asFlatArray()
      .filter((t) => t.p === "A" && t.l);
    // create a map of letters to path/encodings
    const letterMapArr = letterTiles.map((t) => [
      t.l,
      this.tree.encodingOf(t.n),
    ]);
    const letterMap = new Map(letterMapArr);
    // convert each letter to its encoding
    return message.map((letter) => letterMap.get(letter));
  }

  decodeMessage(code) {
    let n = 1;
    let message = [];
    //let i = 0;
    for (let i = 0; i < code.length; i++) {
      let idx = code[i] === "L" ? 0 : 1;
      let nextN = this.tree.graph[n][idx]; // navigate along left or right path
      if (nextN) {
        n = nextN;
      }
      if (this.tree.graph[nextN].length === 0) {
        // leaf
        // get the letter
        const letterTileArr = this.tiles
          .asFlatArray()
          .filter((t) => t.p === "A" && t.n === n);
        message.push(letterTileArr[0].l);
        n = 1; // start at top
      }
    }
    // for(let i=0; i<code.length; i++){ // bug...drops last letter
    //   let idx = code[i] === 'L' ? 0 : 1;
    //   let nextN = this.tree.graph[n][idx];
    //   if(nextN){
    //     n = nextN;
    //   }
    //   else { // leaf
    //     // get the letter
    //     let letterTileArr = this.tiles.asFlatArray().filter((t) => t.p === 'A' && t.n === n);
    //     message.push(letterTileArr[0].l);
    //     n = 1; // start at top
    //     i--; //backup
    //   }
    // }
    return message;
  }

  /**
   * Copy a tile.
   * @param {Tile} t tile to be coppied
   */
  duplicateTile(t) {
    return {
      row: t.row,
      col: t.col,
      p: t.p,
      n: t.n,
      l: t.l,
    };
  }

  /**
   * This will be called on each render.
   * It copies all the tiles, ready to be send to the render function.
   * It also adds the path, and current node information to the tiles.
   */
  tilesToRender() {
    const tiles = []; // # this.tiles.tiles.slice(); // shallow copy
    let path = [];
    if (this.currTile.n) {
      path = this.tree.pathToRoot(this.currTile.n);
    }
    for (let row = 0; row < this.tiles.dim.rows; row++) {
      tiles[row] = [];
      for (let col = 0; col < this.tiles.dim.cols; col++) {
        tiles[row][col] = this.duplicateTile(this.tiles.tiles[row][col]);
        tiles[row][col].isCurrTile = false;
        tiles[row][col].isInPath = false;
        if (path.includes(tiles[row][col].n)) {
          // if there is a path, we will indicate that for the render function to highlight.
          tiles[row][col].isInPath = true;
        }
      }
    }
    // set currTile
    tiles[this.currTile.row][this.currTile.col].isCurrTile = true;
    return tiles;
  }
}

export default LetterTree;
//module.exports = LetterTree;
