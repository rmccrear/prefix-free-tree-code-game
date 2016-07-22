"use strict";

class Tiles {

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

  createEmptyTile(loc){
    return {
      p: 'E',
      row: loc.row,
      col: loc.col,
      n: 0
    };
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

}

module.exports = Tiles;
