
"use strict";

var Tiles = require('../app/lib/tiles.js');

var jf = require('jsonfile');
var assert = require('chai').assert;
var equal = assert.equal;

const containsTile = function(tilesInBranch, tileLoc){
  return tilesInBranch.map((t)=>t.col===tileLoc.col&&t.row===tileLoc.row).includes(true);
};

describe('Tiles', function() {
  it('should initialize', function(){
    const file = './test/data/tiles-test.json'
    let tilesInput = jf.readFileSync(file);
    let tiles1 = new Tiles({tiles: tilesInput.tiles1});
    assert.equal(tiles1.tiles.length, 8, 'there should be 8 rows in tiles1');
  });
  // "tiles1": [[{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}],
  //            [{"p": "E"}, {"p": "L"}, {"p": "L"}, {"p": "L"}, {"p": "L"}, {"p": "E"}],
  //            [{"p": "E"}, {"p": "L"}, {"p": "L"}, {"p": "L"}, {"p": "L"}, {"p": "E"}],
  //            [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "L"}, {"p": "E"}, {"p": "E"}],
  //            [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}],
  //            [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}],
  //            [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}],
  //            [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}]],
  it('should move tiles to the right', function(){
    const file = './test/data/tiles-test.json'
    let tilesInput = jf.readFileSync(file);
    let tiles1 = new Tiles({tiles: tilesInput.tiles1});
    const tilesToMove = tiles1.tiles
                                    .reduce((a,b)=>a.concat(b)) // flatten
                                    .filter((t)=>t.p!=='E');    // take only L
    tiles1.moveTiles(tilesToMove, 'R');
    const expectedTilesAfterMove = /*[
             [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}],
             [{"p": "E"}, {"p": "E"}, {"p": "L"}, {"p": "L"}, {"p": "L"}, {"p": "L"}],
             [{"p": "E"}, {"p": "E"}, {"p": "L"}, {"p": "L"}, {"p": "L"}, {"p": "L"}],
             [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}],
             [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}],
             [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}],
             [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}],
             [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}]
    ];*/
            [[{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "V"}, {"p": "E"}, {"p": "E"}],
             [{"p": "E"}, {"p": "E"}, {"p": "L"}, {"p": "T"}, {"p": "R"}, {"p": "E"}],
             [{"p": "E"}, {"p": "E"}, {"p": "V"}, {"p": "E"}, {"p": "V"}, {"p": "E"}],
             [{"p": "E"}, {"p": "E"}, {"p": "A"}, {"p": "L"}, {"p": "T"}, {"p": "R"}],
             [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "V"}, {"p": "E"}, {"p": "V"}],
             [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "A"}, {"p": "E"}, {"p": "A"}],
             [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}],
             [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}]]
    for(let i=0; i<expectedTilesAfterMove.length; i++){
      for(let j=0; j<expectedTilesAfterMove[i].length; j++){
        assert.equal(tiles1.tiles[i][j].p, expectedTilesAfterMove[i][j].p);
      }
    }
  });
  //              0           1           2           3           4           5
  // "tiles2": [[{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "L"}, {"p": "E"}],
  // 1          [{"p": "L"}, {"p": "L"}, {"p": "L"}, {"p": "L"}, {"p": "L"}, {"p": "T"}],
  // 2          [{"p": "E"}, {"p": "L"}, {"p": "L"}, {"p": "L"}, {"p": "L"}, {"p": "E"}],
  // 3          [{"p": "L"}, {"p": "L"}, {"p": "L"}, {"p": "L"}, {"p": "E"}, {"p": "E"}],
  // 4          [{"p": "E"}, {"p": "L"}, {"p": "E"}, {"p": "L"}, {"p": "T"}, {"p": "E"}],
  // 5          [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "T"}, {"p": "E"}, {"p": "E"}],
  // 6          [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}],
  // 7          [{"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}, {"p": "E"}]],
  // rightBorder = [0,4], [1,4], [2,4], [3,3], [4, 3]
  // downBorder  = [3, 0], [4, 1], [3, 2], [4, 3], [2, 4]
  it('should find the right or lower edge of a set of tiles', function(){
    const file = './test/data/tiles-1.json'
    let tilesInput = jf.readFileSync(file);
    let tiles2 = new Tiles({tiles: tilesInput.tiles2});
    const tilesToMove = tiles2.tiles
                                    .reduce((a,b)=>a.concat(b)) // flatten
                                    .filter((t)=>t.p==='L');    // take only L
    // right edge
    const expectedRightBorder = [{row: 0, col: 4}, {row: 1, col: 4}, {row: 2, col: 4},
                                  {row: 3, col: 3}, {row:4, col: 3}];
    const rightBorder = tiles2.detectBorder(tilesToMove, 'R');
    assert.equal(rightBorder.length, expectedRightBorder.length);
    expectedRightBorder.forEach(function(t){
      assert(containsTile(rightBorder, t), 'contains tile + ' + t.row + ', ' + t.col);
    });
    // lower edge
    const downBorder = tiles2.detectBorder(tilesToMove, 'D');
    const expectedDownBorder = [{row:3, col:0}, {row:4, col:1}, {row:3, col:2}, {row:4, col:3}, {row:2, col:4}];

    assert.equal(downBorder.length, expectedDownBorder.length);
    expectedDownBorder.forEach(function(t){
      assert(containsTile(downBorder, t), 'contains tile + ' + t.row + ', ' + t.col);
    });
  });
  it('should find conflicting nodes on the right edge e.g. before a right move', function(){
    const file = './test/data/tiles-1.json'
    let tilesInput = jf.readFileSync(file);
    let tiles2 = new Tiles({tiles: tilesInput.tiles2});
    const tilesToMove = tiles2.tiles
                                    .reduce((a,b)=>a.concat(b)) // flatten
                                    .filter((t)=>t.p==='L');    // take only L
    const rightMoveConflicts = tiles2.detectMoveConflicts(tilesToMove, 'R');
    const expectedRightMoveConflicts = [{row: 1, col: 5}, {row: 4, col: 4}];
    assert.equal(rightMoveConflicts.length, expectedRightMoveConflicts.length);
    expectedRightMoveConflicts.forEach(function(t){
      assert(containsTile(rightMoveConflicts, t), 'right move conflict for: ' + t.col + ', ' + t.row);
    });

    // down moves
    const downMoveConflicts = tiles2.detectMoveConflicts(tilesToMove, 'D');
    const expectedDownMoveConflicts = [{row: 5, col: 3}];
    assert.equal(downMoveConflicts.length, expectedDownMoveConflicts.length, 'down move conflicts');
    expectedDownMoveConflicts.forEach(function(t){
      assert(containsTile(downMoveConflicts, t), 'down move conflict for: ' + t.col + ', ' + t.row);
    });

    // non conflicts
    let tiles1 = new Tiles({tiles: tilesInput.tiles1});
    const rightMoveNonConflict = tiles1.detectMoveConflicts(tilesToMove, 'R');
    assert.equal(rightMoveNonConflict.length, 0);
    const downMoveNonConflict = tiles1.detectMoveConflicts(tilesToMove, 'D');
    assert.equal(downMoveNonConflict.length, 0);
  });

  it('should detect if the tile will overflow out of bounds e.g. before a right move', function(){
    const file = './test/data/tiles-1.json'
    let tilesInput = jf.readFileSync(file);
    let tiles3 = new Tiles({tiles: tilesInput.tiles3});
    const tilesToMove = tiles3.tiles
                                    .reduce((a,b)=>a.concat(b)) // flatten
                                    .filter((t)=>t.p==='L');    // take only L
    assert.equal(tiles3.detectMoveConflicts(tilesToMove, 'L'), false); // false means out of bounds
    assert.equal(tiles3.detectMoveConflicts(tilesToMove, 'D'), false);
  });

  it('tests a few different actions together', function(){
    const file = './test/data/tiles-1.json'
    let tilesInput = jf.readFileSync(file);
    let tiles4 = new Tiles({tiles: tilesInput.tiles4});
    const tilesToMove = tiles4.tiles
                                    .reduce((a,b)=>a.concat(b)) // flatten
                                    .filter((t)=>t.p==='L');    // take only L
                                    
    assert.equal(tiles4.detectMoveConflicts(tilesToMove, 'R').length, 0);
    tiles4.moveTiles(tilesToMove, 'R')
    assert.equal(tiles4.detectMoveConflicts(tilesToMove, 'R').length, 1);
    assert.equal(tiles4.detectMoveConflicts(tilesToMove, 'D').length, 1);

  });
  //TODO: test downward moves once implemented
  //
  describe('resizing tile grid', function(){
    let tiles4;
    let treeTiles3;
    beforeEach(function(){
      const file = './test/data/tiles-1.json'
      let tilesInput = jf.readFileSync(file);
      tiles4 = new Tiles({tiles: tilesInput.tiles4});
      const treeFile3 = './test/data/tree-3.json'
      let input3 = jf.readFileSync(treeFile3);
      treeTiles3 = new Tiles(input3);
    });
    it('should expand the grid right', function(){
      assert.equal(tiles4.tiles[0].length, 6);
      tiles4.expandGrid('R')
      assert.equal(tiles4.tiles[0].length, 7);
    })
    it('should expand the grid down', function(){
      assert.equal(tiles4.tiles.length, 8);
      tiles4.expandGrid('D')
      assert.equal(tiles4.tiles.length, 9);
    })
    it('should expand the grid left', function(){
      // top row?
      assert.equal(tiles4.tiles[0].length, 6);
      assert.equal(tiles4.tiles[1][0].p, 'L')
      tiles4.expandGrid('L')
      assert.equal(tiles4.tiles[0].length, 7);
      assert.equal(tiles4.tiles[1][0].p, 'E')
      assert.equal(tiles4.tiles[1][1].p, 'L')
    })
  })

  // TODO: test asFlatArray() for first row

});
