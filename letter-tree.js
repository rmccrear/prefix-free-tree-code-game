"use strict";

const BinaryTree = require('./binary-tree.js');
const Tiles = require('./tiles.js');

const moveNav = {
  'L': 0,
  'R': 1
};

class LetterTree {
  constructor(input){
    this.tree = new BinaryTree(input);
    this.tiles = new Tiles(input);
    this.currNode = 1;
    let rootNodeTiles = this.findTilesForNode(this.currNode);
    this.currTile = rootNodeTiles[0]; // should be tree root
  }

  getCurrTile(){
    console.log(this.currTile)
    return this.tiles.tiles[this.currTile.row][this.currTile.col];
  }

  findTilesForNode(nodeId){
    return this.tiles.tiles
                           .reduce((a,b)=>a.concat(b)) // flatten
                           .filter((t)=>t.n === nodeId);
  }

  // move to T fork or leaf
  go(direction){
    const currNodeId = this.currTile.n;
    let nextNodeId;
    if(direction === 'L' || direction === 'R'){
      nextNodeId= this.tree.graph[currNodeId][moveNav[direction]];
    }
    else if(direction === 'U'){
      nextNodeId = this.tree.parentOf(currNodeId);
    }
    const nextTerminalTileArr = this.tiles.asFlatArray()
                                       .filter((t)=>t.n === nextNodeId && (t.p === 'T' || t.p === 'A'));

    if(nextTerminalTileArr.length > 0){
      this.currTile = nextTerminalTileArr[0];
    }
  }

  branchOut(tile){
    const nodeId = tile.n;
    const newLeaves = this.tree.branchOut(nodeId);
    let leafTiles = [
      this.tiles.createEmptyTile({row: tile.row, col: tile.col-1}),
      this.tiles.createEmptyTile({row: tile.row+1, col: tile.col-1}),
      this.tiles.createEmptyTile({row: tile.row, col: tile.col+1}),
      this.tiles.createEmptyTile({row: tile.row+1, col: tile.col+1})
    ];
    leafTiles[0].p = 'L';
    leafTiles[1].p = 'A';
    leafTiles[1].l = tile.l; // transfer letter over
    leafTiles[2].p = 'R';
    leafTiles[3].p = 'A';


    let conflicts = [];

    // check dimensions of board
    leafTiles.forEach(function(t){
      if(t.row >= this.tiles.dim.rows){
        console.log('expand down')
        this.tiles.expandGrid('D');
      }
      if(t.col >= this.tiles.dim.cols){
        console.log('expand right')
        this.tiles.expandGrid('R');
      }
      if(t.col<0){
        console.log('expand left')
        console.log(this.tiles.tiles)
        this.tiles.expandGrid('L');
        // move new tiles over
        console.log(this.tiles.tiles)
        leafTiles.forEach((tt)=>tt.col++);
      }
    }, this);

    if(newLeaves.length > 0){
      tile.p = 'T';
      leafTiles[0].n = newLeaves[0];
      leafTiles[1].n = newLeaves[0];
      leafTiles[2].n = newLeaves[1];
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
      if(conflicts.length === 0){
        // insert into tiles
        leafTiles.forEach(function(leaf){
          const r = leaf.row;
          const c = leaf.col;
          this.tiles.tiles[r][c] = leaf;
        }, this);
      }

    }
    return leafTiles;
  }

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

  branchTiles(nodeId){
    const branch = this.tree.branchOf(nodeId);
    return this.tiles.asFlatArray()
                     .map((t)=>t.n)
                     .filter((n)=>branch.includes(n));
  }

  toJSON(){
    return {
      "graph": this.tree.graph,
      "tiles": this.tiles.tiles
    };
  }

  setCurrNodeTile(tile) {
    this.currNode = tile.n;
    this.currTile = tile
  }

  setLetter(node, letter){
    let letterTileArr = this.tiles.asFlatArray().filter((t)=> t.n===node && t.p === 'A');
    let letterTile;
    if(letterTileArr.length>0){
      letterTile = letterTileArr[0];
      letterTile.l = letter;
    }
  }
  setLetterInFirstEmptyLeaf(letter){
    let letterTileArr = this.tiles.asFlatArray().filter((t)=> (typeof t.l === 'undefined' || t.l === null) && t.p === 'A');
    let letterTile;
    if(letterTileArr.length>0){
      letterTile = letterTileArr[0];
      letterTile.l = letter;
    }
    return letterTile;
  }
  hasLetter(letter){
    let letterTileArr = this.tiles.asFlatArray().filter((t)=> t.l === letter && t.p === 'A');
    if(letterTileArr.length>0){
      return letterTileArr[0].n;
    }
    else{
      return false;
    }
  }
  encodeLetter(letter){
    const letterNode = this.hasLetter();
    const letterPath = this.board.tree.pathToRoot(letterNode);
    return letterPath;
  }

}

module.exports = LetterTree;
