"use strict";

/**
 * @typedef {Object} Tile
 * @property {String} p A letter representing the kind of glyph to put on the tile. Could be E T H V or A: Empty, T-shaped, Horizontal, Vertial, or Alpha (a leaf that can contain a letter)
 * @property {Number} row The row location of the tile
 * @property {Number} col The column location of the tile
 * @property {Number} n The id of the node in the assoicated graph that the tile represents.
 */

 /**
  * @typedef {Object} Location
  * @property {Number} row The row location of the tile
  * @property {Number} col The column location of the tile
  */

/**
 * Class representing all the tiles on the board game
 */
class Tiles {

  /**
   * 
   * @param {Object} input 
   */
  constructor(input){
    this.tiles = input.tiles;
    this.dim = {rows: input.tiles.length, cols: input.tiles[0].length};
    // add col and row keys to each tiles
    for(let i=0; i<this.dim.rows; i++){
      for(let j=0; j<this.dim.cols; j++){
        this.tiles[i][j].row = i;
        this.tiles[i][j].col = j;
      }
    }
  }

  asFlatArray(){
    return this.tiles.reduce((a,b)=>a.concat(b));
  }

  createEmptyTile(loc){
    return {
      p: 'E',       // for "empty"
      row: loc.row,
      col: loc.col,
      n: 0          // n is the index of the node in the graph
                    // the tiles representing the edge of the graph also get the same value for n
    };
  }

  moveAllTiles(direction){
    const allTiles = this.asFlatArray().filter((t)=>t.p!=='E');
    console.log(allTiles)
    this.moveTiles(allTiles, direction);
  }

  // tiles is a flat array of all tiles to copy
  moveTiles(tiles, direction){
    // TODO: implement 'D' direction
    if(direction === 'R'){
      // move right
      // move row by row, highest col to lowest
      let leftovers = tiles.slice(); // shallow copy of all tiles to copy
      while(leftovers.length>0){
        const t = leftovers[0]; // choose one at random
        let row = leftovers.filter((tt)=>tt.row === t.row); // get its row
        row.sort((a,b)=> a.col-b.col ); // make sure the row is in order
        row.reverse();                  // take the reverse order to start from the right
        row.forEach((tt)=>{
          this.tiles[tt.row][tt.col+1] = tt;
          this.tiles[tt.row][tt.col] = this.createEmptyTile({row: tt.row, col: tt.col}); // could just do this at the end.
          tt.col = tt.col+1; // correct the location for the tile
        });

        leftovers = leftovers.filter((tt)=>tt.row !== t.row); // the rest will be worked on later
      }
    }
    return tiles;
  }

  detectBorder(tiles, direction){
    let border = [];
    if(direction === 'R'){
      let leftovers = tiles.slice();
      while(leftovers.length>0){
        const t = leftovers[0]; // choose one at random
        let tilesInThisRow = leftovers.filter((tt)=>tt.row === t.row); // get its row
        //find it's max col...hat is the rightmost of the row
        const rightmostCol = Math.max.apply(null, tilesInThisRow.map((tt)=>tt.col));
        border.push(this.tiles[t.row][rightmostCol]);
        leftovers = leftovers.filter((tt)=>tt.row!==t.row);
      }
    }
    if(direction === 'D'){ // lower border "Down" (lower on the chart tile is a higher number)
      let leftovers = tiles.slice();
      while(leftovers.length>0){
        const t = leftovers[0]; // choose one at random
        let tilesInThisCol = leftovers.filter((tt)=>tt.col === t.col); // get its col 
        //find it's max row...that is the lowermost of the col
        const downmostRow = Math.max.apply(null, tilesInThisCol.map((tt)=>tt.row));
        border.push(this.tiles[downmostRow][t.col]);
        leftovers = leftovers.filter((tt)=>tt.col!==t.col);
      }

    }
    return border;
  }

  detectConflicts(tiles){
    let conflicts = [];
    for(let i=0; i<tiles.length; i++){
      const t = tiles[i];
      // be careful, we don't go over the edge of the array!
      if(  t.row  >= this.dim.rows || t.row < 0
         || t.col >= this.dim.cols || t.col < 0){
        return false;
      }
      const tt = this.tiles[t.row][t.col];
      if(tt.p !== 'E'){ // if not empty, it is a conflict
        conflicts.push(tt);
      }
    }
    return conflicts;
  }

  // return [] if no conflicts
  // return false if out of bounds
  // return array of conflict nodes if there are conflicts with other tiles
  detectMoveConflicts(tiles, direction) {
    let conflicts = [];
    let move = {row: 0, col: 0};
    if(direction === 'R'){
      move = {row: 0, col: 1};
    }
    else if(direction === 'D'){
      move = {row: 1, col: 0};
    }
    const border = this.detectBorder(tiles, direction);
    // check right
    for(let i=0; i<border.length; i++){
      const t = border[i];
      // be careful, we don't go over the edge of the array!
      const neighborRow = t.row + move.row;
      const neighborCol = t.col + move.col;
      if(  neighborRow  >= this.dim.rows || neighborRow < 0
         || neighborCol >= this.dim.cols || neighborCol < 0){
        return false;
      }
      const neighborTile = this.tiles[neighborRow][neighborCol];
      if(neighborTile.p !== 'E'){ // if not empty, it is a conflict
        conflicts.push(neighborTile);
      }
    }
    return conflicts;
  }

  expandGrid(direction, amount){
    amount = 1 || amount;
    if(direction === 'D'){
      let newRow = [];
      const newRowId = this.dim.rows;
      for(let i=0; i<this.dim.cols; i++){
          let newTile = this.createEmptyTile({row: newRowId, col: i});
          newRow.push(newTile);
      }
      this.tiles.push(newRow);
      this.dim.rows = this.tiles.length;
    }
    else if(direction === 'R'){
      for(let i=0; i<this.dim.rows; i++){
        const newColId = this.dim.cols;
        let newTile = this.createEmptyTile({row: i, col: newColId});
        this.tiles[i].push(newTile);
      }
      this.dim.cols = this.tiles[0].length;
    }
    else if(direction === 'L'){
      this.expandGrid('R');
      this.moveTiles(this.asFlatArray().filter((t)=>t.p !== 'E'), 'R'); // move all non empty tiles left
    }
  }

}

module.exports = Tiles;
