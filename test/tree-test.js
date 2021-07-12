"use strict";

var BinaryTree = require('../app/lib/binary-tree.js');

var jf = require('jsonfile');
var assert = require('chai').assert;
var equal = assert.equal;


describe('BinaryTree', function() {

 // tree 1
 // "graph": [
 //      [],     // 0
 //      [2, 3], // 1
 //      [4, 5], // 2
 //      [],     // 3
 //      [],     // 4
 //      [6, 7], // 5
 //      [],     // 6
 //      [8, 9], // 7
 //      [],     // 8
 //      []      // 9
 //    ],
 // tree 2
 // "graph": [
 //      [],     // 0
 //      [2, 3], // 1
 //      [4, 5], // 2
 //      [],     // 3
 //      [10, 11],     // 4
 //      [6, 7], // 5
 //      [],     // 6
 //      [8, 9], // 7
 //      [],     // 8
 //      []      // 9
 //      [12, 13] // 10
  //     [],      // 11
  //     [],      // 12
  //     [14, 15],// 13
  //     [],      // 14
  //     [],      // 15
 //    ],

  it('should load the tree from json', function(){
    const file = './test/data/tree-1.json'
    let treeInput = jf.readFileSync(file);
    let tree = new BinaryTree(treeInput);
    assert.equal(tree.graph.length, 10, 'tree size should be 10');
  });

  it('should find parent and path to root', function(){
    const file = './test/data/tree-1.json'
    let treeInput = jf.readFileSync(file);
    let tree = new BinaryTree(treeInput);
    const startNode = 7;
    const expectedPathFrom9 = [9, 7, 5, 2, 1];

    assert.equal(tree.parentOf(9), 7);
    assert.equal(tree.parentOf(7), 5);
    assert.equal(tree.parentOf(5), 2);
    assert.equal(tree.parentOf(2), 1);

    const pathFrom9 = tree.pathToRoot(9);
    assert.equal(pathFrom9.length, expectedPathFrom9.length);
    for(let i=0; i<expectedPathFrom9; i++){
      assert.equal(pathFrom9[i], expectedPathFrom9[i]);
    }
  });

  it('should find a common ancestor', function(){
    const file = './test/data/tree-1.json'
    let treeInput = jf.readFileSync(file);
    let tree = new BinaryTree(treeInput);

    const node7 = 7;
    const node4 = 4;
    const expectedAncestor7and4 = 2;

    assert.equal(tree.commonAncestorOf(node7, node4), expectedAncestor7and4);
  });

  it('should find a common ancestor using tree 2 data', function(){
    const file2 = './test/data/tree-2.json'
    let treeInput2 = jf.readFileSync(file2);
    let tree2 = new BinaryTree(treeInput2);

    const node7 = 7;
    const node15 = 15;
    const expectedAncestor7and15 = 2;
    assert.equal(tree2.commonAncestorOf(node7, node15), expectedAncestor7and15);
  });


  it('should branch out a leaf', function(){
    let treeInput = {graph: [[] ,[2, 3], [], []]};
    let tree = new BinaryTree(treeInput);
    const newNodes = tree.branchOut(2);
    const expectedGraph = [[] ,[2, 3], [4, 5], [], [], []];

    assert.equal(tree.graph.length, expectedGraph.length, 'size of graphs is same');
    for(let i = 0; i<expectedGraph.length; i++){
      assert.equal(tree.graph[i].length, expectedGraph[i].length, i + ' is leaf or branch ');
      if(expectedGraph.length>0){
        assert.equal(tree.graph[i][0], expectedGraph[i][0]);
        assert.equal(tree.graph[i][1], expectedGraph[i][1]);
      }
    }
  });

  it('should find a branch of a node', function(){
    const file2 = './test/data/tree-2.json'
    let treeInput2 = jf.readFileSync(file2);
    let tree = new BinaryTree(treeInput2);

    const branchOf4 = tree.branchOf(4);
    const expectedBranchOf4 = [4, 10, 11, 12, 13, 14, 15];

    assert.equal(branchOf4.length, expectedBranchOf4.length);
    for(let i = 0; i<expectedBranchOf4.length; i++){
      expectedBranchOf4.includes(branchOf4[i])
    }
  });
});
