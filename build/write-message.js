(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var LetterTree = require('../letter-tree.js');
var TreeBuilder = require('../tree-builder.js');

var jsonTree = require('../data/tree-command-13x25.json');

var board = void 0;
var treeBuilder = void 0;

board = new LetterTree(jsonTree);
treeBuilder = new TreeBuilder(board, jsonTree.treeBuilder);

function encodeMessage(board, message) {
  var letterTiles = board.tiles.asFlatArray(function (t) {
    return t.p === 'A' && t.l;
  });
  var letterMapArr = letterTiles.map(function (t) {
    return [t.l, board.tree.encodingOf(t.n)];
  });
  var letterMap = new Map(letterMapArr);
  return message.map(function (letter) {
    return letterMap.get(letter).join('');
  }).join(' ');
}

function classes(tile) {
  var c = '';
  var glyphs = {
    L: 'pipe-L',
    R: 'pipe-R',
    T: 'pipe-T',
    H: 'pipe-H',
    V: 'pipe-V',
    A: 'pipe-A',
    E: 'pipe-E'
  };
  c += ' ' + glyphs[tile.p];
  if (tile.isInPath) {
    c += ' pipe-red ';
  }
  return c;
}

function style(tile) {
  var top = tile.row * 32;
  var left = tile.col * 32;
  return 'position: absolute; top: ' + top + 'px; left: ' + left + 'px;';
}

var onReady = function onReady() {
  var root = $('<div>');
  var tiles = board.tilesToRender();
  for (var i = 0; i < tiles.length; i++) {
    for (var j = 0; j < tiles[i].length; j++) {
      var t = tiles[i][j];
      var letter = t.l || '';
      var styleStr = style(t);
      root.append('<div class="pipe-tile ' + classes(t) + '" style="' + styleStr + '">' + letter + '</div>');
    }
  }
  $('#board').append(root);
  $('#message').on('input', function () {
    var message = $(this).val();
    updateTreeWithMessage(message);
    var code = encodeMessage(board, message.split(''));
    $('#code').text(code);
  });
};

function repaint() {
  var root = $('<div>');
  var tiles = board.tilesToRender();
  for (var i = 0; i < tiles.length; i++) {
    for (var j = 0; j < tiles[i].length; j++) {
      var t = tiles[i][j];
      var letter = t.l || '';
      var styleStr = style(t);
      root.append('<div class="pipe-tile ' + classes(t) + '" style="' + styleStr + '"><div class="pipe-letter">' + letter + '</div></div>');
    }
  }
  $('#board').html(root);
}

function updateTreeWithMessage(message) {
  var messageChars = _.uniq(message.split(''));
  // remove dups
  messageChars.forEach(function (letter) {
    return treeBuilder.insertLetter(letter);
  });
  repaint();
}

$(onReady);

},{"../data/tree-command-13x25.json":3,"../letter-tree.js":4,"../tree-builder.js":6}],2:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BinaryTree = function () {
  function BinaryTree(input) {
    _classCallCheck(this, BinaryTree);

    this.graph = input.graph;
    this.leafData = input.leafData;
    this.root = 1;
  }

  _createClass(BinaryTree, [{
    key: 'branchOut',
    value: function branchOut(leafNode) {
      if (this.isLeaf(leafNode)) {
        var nextIds = [this.graph.length, this.graph.length + 1];
        this.graph[leafNode] = nextIds;
        // add two leaf nodes to the graph
        this.graph.push([]);
        this.graph.push([]);
        return nextIds;
      } else {
        return [];
      }
    }
  }, {
    key: 'isLeaf',
    value: function isLeaf(node) {
      return this.graph[node].length === 0;
    }

    // get branch starting at node

  }, {
    key: 'branchOf',
    value: function branchOf(node) {
      var branchNodes = [node]; // initial step
      for (var i = 0; i < this.graph[node].length; i++) {
        branchNodes = branchNodes.concat(this.branchOf(this.graph[node][i]));
      }
      return branchNodes;
    }

    // get parent of node

  }, {
    key: 'parentOf',
    value: function parentOf(node) {
      var n;
      for (var i = 0; i < this.graph.length; i++) {
        n = this.graph[i];
        if (n.length > 0) {
          if (n.includes(node)) {
            return i;
          }
        }
      }
      return false;
    }
  }, {
    key: 'pathToRoot',
    value: function pathToRoot(node) {
      var n = node;
      var path = [];
      while (n !== this.root) {
        path.push(n);
        n = this.parentOf(n);
      }
      path.push(this.root);
      return path;
    }
  }, {
    key: 'encodingOf',
    value: function encodingOf(node) {
      var n = node;
      var code = [];
      while (n && n !== this.root) {
        var direction = this.branchDirectionOf(n);
        code.push(direction);
        n = this.parentOf(n);
      }
      return code;
    }
  }, {
    key: 'commonAncestorOf',
    value: function commonAncestorOf(node1, node2) {
      var path1 = this.pathToRoot(node1);
      var path2 = this.pathToRoot(node2);

      var commonAncestor = this.root;
      var n1 = path1.pop();
      var n2 = path2.pop();

      while (n1 !== undefined && n2 !== undefined && n1 === n2) {
        commonAncestor = n1; // === n2
        n1 = path1.pop(); // if no more in stack, its undefined
        n2 = path2.pop();
      }
      return commonAncestor;
    }
  }, {
    key: 'branchDirectionOf',
    value: function branchDirectionOf(node) {
      var parent = this.parentOf(node);
      //    console.log("parent: " + parent)
      //    console.log("parent[0]: " + parent[0])
      if (parent && this.graph[parent][0] === node) {
        return 'L';
      } else if (parent && this.graph[parent][1] === node) {
        return 'R';
      }
    }
  }]);

  return BinaryTree;
}();

module.exports = BinaryTree;

},{}],3:[function(require,module,exports){
module.exports={"graph":[[],[2,3],[],[]],
  "tiles":[[{"p":"E","n":0,"row":0,"col":0},{"p":"E","n":0,"row":0,"col":1},{"p":"E","row":0,"col":2,"n":0},{"p":"E","row":0,"col":3,"n":0},{"p":"E","row":0,"col":4,"n":0},{"p":"E","row":0,"col":5,"n":0},{"p":"V","n":1,"row":1,"col":6},{"p":"E","row":0,"col":7,"n":0},{"p":"E","row":0,"col":8,"n":0},{"p":"E","row":0,"col":9,"n":0},{"p":"E","row":0,"col":10,"n":0},{"p":"E","row":0,"col":11,"n":0},{"p":"E","row":0,"col":12,"n":0}],
    [{"p":"E","n":0,"row":1,"col":0},{"p":"E","n":0,"row":1,"col":1},{"p":"L","row":1,"col":2,"n":2},{"p":"H","row":1,"col":3,"n":2},{"p":"H","row":1,"col":4,"n":2},{"p":"H","row":1,"col":5,"n":2},{"p":"T","n":1,"row":1,"col":6},{"p":"H","row":1,"col":7,"n":3},{"p":"R","row":1,"col":8,"n":3},{"p":"E","row":1,"col":9,"n":0},{"p":"E","row":1,"col":10,"n":0},{"p":"E","row":1,"col":11,"n":0},{"p":"E","row":1,"col":12,"n":0}],
    [{"p":"E","n":0,"row":2,"col":0},{"p":"E","n":0,"row":2,"col":1},{"p":"A","n":2,"row":2,"col":2},{"p":"E","n":0,"row":2,"col":3},{"p":"E","n":0,"row":2,"col":4},{"p":"E","row":2,"col":5,"n":0},{"p":"E","row":2,"col":6,"n":0},{"p":"E","row":2,"col":7,"n":0},{"p":"A","row":2,"col":8,"n":3},{"p":"E","row":2,"col":9,"n":0},{"p":"E","row":2,"col":10,"n":0},{"p":"E","row":2,"col":11,"n":0},{"p":"E","row":2,"col":12,"n":0}],
    [{"p":"E","n":0,"row":3,"col":0},{"p":"E","n":0,"row":3,"col":1},{"p":"E","n":0,"row":3,"col":2},{"p":"E","n":0,"row":3,"col":3},{"p":"E","n":0,"row":3,"col":4},{"p":"E","row":3,"col":5,"n":0},{"p":"E","row":3,"col":6,"n":0},{"p":"E","row":3,"col":7,"n":0},{"p":"E","row":3,"col":8,"n":0},{"p":"E","row":3,"col":9,"n":0},{"p":"E","row":3,"col":10,"n":0},{"p":"E","row":3,"col":11,"n":0},{"p":"E","row":3,"col":12,"n":0}],
    [{"p":"E","n":0,"row":4,"col":0},{"p":"E","n":0,"row":4,"col":1},{"p":"E","n":0,"row":4,"col":2},{"p":"E","n":0,"row":4,"col":3},{"p":"E","n":0,"row":4,"col":4},{"p":"E","row":4,"col":5,"n":0},{"p":"E","row":4,"col":6,"n":0},{"p":"E","row":4,"col":7,"n":0},{"p":"E","row":4,"col":8,"n":0},{"p":"E","row":4,"col":9,"n":0},{"p":"E","row":4,"col":10,"n":0},{"p":"E","row":4,"col":11,"n":0},{"p":"E","row":4,"col":12,"n":0}],
    [{"p":"E","n":0,"row":5,"col":0},{"p":"E","n":0,"row":5,"col":1},{"p":"E","n":0,"row":5,"col":2},{"p":"E","n":0,"row":5,"col":3},{"p":"E","n":0,"row":5,"col":4},{"p":"E","row":5,"col":5,"n":0},{"p":"E","row":5,"col":6,"n":0},{"p":"E","row":5,"col":7,"n":0},{"p":"E","row":5,"col":8,"n":0},{"p":"E","row":5,"col":9,"n":0},{"p":"E","row":5,"col":10,"n":0},{"p":"E","row":5,"col":11,"n":0},{"p":"E","row":5,"col":12,"n":0}],[{"p":"E","row":6,"col":0,"n":0},{"p":"E","row":6,"col":1,"n":0},{"p":"E","row":6,"col":2,"n":0},{"p":"E","row":6,"col":3,"n":0},{"p":"E","row":6,"col":4,"n":0},{"p":"E","row":6,"col":5,"n":0},{"p":"E","row":6,"col":6,"n":0},{"p":"E","row":6,"col":7,"n":0},{"p":"E","row":6,"col":8,"n":0},{"p":"E","row":6,"col":9,"n":0},{"p":"E","row":6,"col":10,"n":0},{"p":"E","row":6,"col":11,"n":0},{"p":"E","row":6,"col":12,"n":0}],[{"p":"E","row":7,"col":0,"n":0},{"p":"E","row":7,"col":1,"n":0},{"p":"E","row":7,"col":2,"n":0},{"p":"E","row":7,"col":3,"n":0},{"p":"E","row":7,"col":4,"n":0},{"p":"E","row":7,"col":5,"n":0},{"p":"E","row":7,"col":6,"n":0},{"p":"E","row":7,"col":7,"n":0},{"p":"E","row":7,"col":8,"n":0},{"p":"E","row":7,"col":9,"n":0},{"p":"E","row":7,"col":10,"n":0},{"p":"E","row":7,"col":11,"n":0},{"p":"E","row":7,"col":12,"n":0}],[{"p":"E","row":8,"col":0,"n":0},{"p":"E","row":8,"col":1,"n":0},{"p":"E","row":8,"col":2,"n":0},{"p":"E","row":8,"col":3,"n":0},{"p":"E","row":8,"col":4,"n":0},{"p":"E","row":8,"col":5,"n":0},{"p":"E","row":8,"col":6,"n":0},{"p":"E","row":8,"col":7,"n":0},{"p":"E","row":8,"col":8,"n":0},{"p":"E","row":8,"col":9,"n":0},{"p":"E","row":8,"col":10,"n":0},{"p":"E","row":8,"col":11,"n":0},{"p":"E","row":8,"col":12,"n":0}],[{"p":"E","row":9,"col":0,"n":0},{"p":"E","row":9,"col":1,"n":0},{"p":"E","row":9,"col":2,"n":0},{"p":"E","row":9,"col":3,"n":0},{"p":"E","row":9,"col":4,"n":0},{"p":"E","row":9,"col":5,"n":0},{"p":"E","row":9,"col":6,"n":0},{"p":"E","row":9,"col":7,"n":0},{"p":"E","row":9,"col":8,"n":0},{"p":"E","row":9,"col":9,"n":0},{"p":"E","row":9,"col":10,"n":0},{"p":"E","row":9,"col":11,"n":0},{"p":"E","row":9,"col":12,"n":0}],[{"p":"E","row":10,"col":0,"n":0},{"p":"E","row":10,"col":1,"n":0},{"p":"E","row":10,"col":2,"n":0},{"p":"E","row":10,"col":3,"n":0},{"p":"E","row":10,"col":4,"n":0},{"p":"E","row":10,"col":5,"n":0},{"p":"E","row":10,"col":6,"n":0},{"p":"E","row":10,"col":7,"n":0},{"p":"E","row":10,"col":8,"n":0},{"p":"E","row":10,"col":9,"n":0},{"p":"E","row":10,"col":10,"n":0},{"p":"E","row":10,"col":11,"n":0},{"p":"E","row":10,"col":12,"n":0}],[{"p":"E","row":11,"col":0,"n":0},{"p":"E","row":11,"col":1,"n":0},{"p":"E","row":11,"col":2,"n":0},{"p":"E","row":11,"col":3,"n":0},{"p":"E","row":11,"col":4,"n":0},{"p":"E","row":11,"col":5,"n":0},{"p":"E","row":11,"col":6,"n":0},{"p":"E","row":11,"col":7,"n":0},{"p":"E","row":11,"col":8,"n":0},{"p":"E","row":11,"col":9,"n":0},{"p":"E","row":11,"col":10,"n":0},{"p":"E","row":11,"col":11,"n":0},{"p":"E","row":11,"col":12,"n":0}],[{"p":"E","row":12,"col":0,"n":0},{"p":"E","row":12,"col":1,"n":0},{"p":"E","row":12,"col":2,"n":0},{"p":"E","row":12,"col":3,"n":0},{"p":"E","row":12,"col":4,"n":0},{"p":"E","row":12,"col":5,"n":0},{"p":"E","row":12,"col":6,"n":0},{"p":"E","row":12,"col":7,"n":0},{"p":"E","row":12,"col":8,"n":0},{"p":"E","row":12,"col":9,"n":0},{"p":"E","row":12,"col":10,"n":0},{"p":"E","row":12,"col":11,"n":0},{"p":"E","row":12,"col":12,"n":0}],[{"p":"E","row":13,"col":0,"n":0},{"p":"E","row":13,"col":1,"n":0},{"p":"E","row":13,"col":2,"n":0},{"p":"E","row":13,"col":3,"n":0},{"p":"E","row":13,"col":4,"n":0},{"p":"E","row":13,"col":5,"n":0},{"p":"E","row":13,"col":6,"n":0},{"p":"E","row":13,"col":7,"n":0},{"p":"E","row":13,"col":8,"n":0},{"p":"E","row":13,"col":9,"n":0},{"p":"E","row":13,"col":10,"n":0},{"p":"E","row":13,"col":11,"n":0},{"p":"E","row":13,"col":12,"n":0}],[{"p":"E","row":14,"col":0,"n":0},{"p":"E","row":14,"col":1,"n":0},{"p":"E","row":14,"col":2,"n":0},{"p":"E","row":14,"col":3,"n":0},{"p":"E","row":14,"col":4,"n":0},{"p":"E","row":14,"col":5,"n":0},{"p":"E","row":14,"col":6,"n":0},{"p":"E","row":14,"col":7,"n":0},{"p":"E","row":14,"col":8,"n":0},{"p":"E","row":14,"col":9,"n":0},{"p":"E","row":14,"col":10,"n":0},{"p":"E","row":14,"col":11,"n":0},{"p":"E","row":14,"col":12,"n":0}],[{"p":"E","row":15,"col":0,"n":0},{"p":"E","row":15,"col":1,"n":0},{"p":"E","row":15,"col":2,"n":0},{"p":"E","row":15,"col":3,"n":0},{"p":"E","row":15,"col":4,"n":0},{"p":"E","row":15,"col":5,"n":0},{"p":"E","row":15,"col":6,"n":0},{"p":"E","row":15,"col":7,"n":0},{"p":"E","row":15,"col":8,"n":0},{"p":"E","row":15,"col":9,"n":0},{"p":"E","row":15,"col":10,"n":0},{"p":"E","row":15,"col":11,"n":0},{"p":"E","row":15,"col":12,"n":0}],[{"p":"E","row":16,"col":0,"n":0},{"p":"E","row":16,"col":1,"n":0},{"p":"E","row":16,"col":2,"n":0},{"p":"E","row":16,"col":3,"n":0},{"p":"E","row":16,"col":4,"n":0},{"p":"E","row":16,"col":5,"n":0},{"p":"E","row":16,"col":6,"n":0},{"p":"E","row":16,"col":7,"n":0},{"p":"E","row":16,"col":8,"n":0},{"p":"E","row":16,"col":9,"n":0},{"p":"E","row":16,"col":10,"n":0},{"p":"E","row":16,"col":11,"n":0},{"p":"E","row":16,"col":12,"n":0}],[{"p":"E","row":17,"col":0,"n":0},{"p":"E","row":17,"col":1,"n":0},{"p":"E","row":17,"col":2,"n":0},{"p":"E","row":17,"col":3,"n":0},{"p":"E","row":17,"col":4,"n":0},{"p":"E","row":17,"col":5,"n":0},{"p":"E","row":17,"col":6,"n":0},{"p":"E","row":17,"col":7,"n":0},{"p":"E","row":17,"col":8,"n":0},{"p":"E","row":17,"col":9,"n":0},{"p":"E","row":17,"col":10,"n":0},{"p":"E","row":17,"col":11,"n":0},{"p":"E","row":17,"col":12,"n":0}],[{"p":"E","row":18,"col":0,"n":0},{"p":"E","row":18,"col":1,"n":0},{"p":"E","row":18,"col":2,"n":0},{"p":"E","row":18,"col":3,"n":0},{"p":"E","row":18,"col":4,"n":0},{"p":"E","row":18,"col":5,"n":0},{"p":"E","row":18,"col":6,"n":0},{"p":"E","row":18,"col":7,"n":0},{"p":"E","row":18,"col":8,"n":0},{"p":"E","row":18,"col":9,"n":0},{"p":"E","row":18,"col":10,"n":0},{"p":"E","row":18,"col":11,"n":0},{"p":"E","row":18,"col":12,"n":0}],[{"p":"E","row":19,"col":0,"n":0},{"p":"E","row":19,"col":1,"n":0},{"p":"E","row":19,"col":2,"n":0},{"p":"E","row":19,"col":3,"n":0},{"p":"E","row":19,"col":4,"n":0},{"p":"E","row":19,"col":5,"n":0},{"p":"E","row":19,"col":6,"n":0},{"p":"E","row":19,"col":7,"n":0},{"p":"E","row":19,"col":8,"n":0},{"p":"E","row":19,"col":9,"n":0},{"p":"E","row":19,"col":10,"n":0},{"p":"E","row":19,"col":11,"n":0},{"p":"E","row":19,"col":12,"n":0}],[{"p":"E","row":20,"col":0,"n":0},{"p":"E","row":20,"col":1,"n":0},{"p":"E","row":20,"col":2,"n":0},{"p":"E","row":20,"col":3,"n":0},{"p":"E","row":20,"col":4,"n":0},{"p":"E","row":20,"col":5,"n":0},{"p":"E","row":20,"col":6,"n":0},{"p":"E","row":20,"col":7,"n":0},{"p":"E","row":20,"col":8,"n":0},{"p":"E","row":20,"col":9,"n":0},{"p":"E","row":20,"col":10,"n":0},{"p":"E","row":20,"col":11,"n":0},{"p":"E","row":20,"col":12,"n":0}],[{"p":"E","row":21,"col":0,"n":0},{"p":"E","row":21,"col":1,"n":0},{"p":"E","row":21,"col":2,"n":0},{"p":"E","row":21,"col":3,"n":0},{"p":"E","row":21,"col":4,"n":0},{"p":"E","row":21,"col":5,"n":0},{"p":"E","row":21,"col":6,"n":0},{"p":"E","row":21,"col":7,"n":0},{"p":"E","row":21,"col":8,"n":0},{"p":"E","row":21,"col":9,"n":0},{"p":"E","row":21,"col":10,"n":0},{"p":"E","row":21,"col":11,"n":0},{"p":"E","row":21,"col":12,"n":0}],[{"p":"E","row":22,"col":0,"n":0},{"p":"E","row":22,"col":1,"n":0},{"p":"E","row":22,"col":2,"n":0},{"p":"E","row":22,"col":3,"n":0},{"p":"E","row":22,"col":4,"n":0},{"p":"E","row":22,"col":5,"n":0},{"p":"E","row":22,"col":6,"n":0},{"p":"E","row":22,"col":7,"n":0},{"p":"E","row":22,"col":8,"n":0},{"p":"E","row":22,"col":9,"n":0},{"p":"E","row":22,"col":10,"n":0},{"p":"E","row":22,"col":11,"n":0},{"p":"E","row":22,"col":12,"n":0}],[{"p":"E","row":23,"col":0,"n":0},{"p":"E","row":23,"col":1,"n":0},{"p":"E","row":23,"col":2,"n":0},{"p":"E","row":23,"col":3,"n":0},{"p":"E","row":23,"col":4,"n":0},{"p":"E","row":23,"col":5,"n":0},{"p":"E","row":23,"col":6,"n":0},{"p":"E","row":23,"col":7,"n":0},{"p":"E","row":23,"col":8,"n":0},{"p":"E","row":23,"col":9,"n":0},{"p":"E","row":23,"col":10,"n":0},{"p":"E","row":23,"col":11,"n":0},{"p":"E","row":23,"col":12,"n":0}],[{"p":"E","row":24,"col":0,"n":0},{"p":"E","row":24,"col":1,"n":0},{"p":"E","row":24,"col":2,"n":0},{"p":"E","row":24,"col":3,"n":0},{"p":"E","row":24,"col":4,"n":0},{"p":"E","row":24,"col":5,"n":0},{"p":"E","row":24,"col":6,"n":0},{"p":"E","row":24,"col":7,"n":0},{"p":"E","row":24,"col":8,"n":0},{"p":"E","row":24,"col":9,"n":0},{"p":"E","row":24,"col":10,"n":0},{"p":"E","row":24,"col":11,"n":0},{"p":"E","row":24,"col":12,"n":0}]],
    "moveRecord":["]","D","]","D","]","D","]","D","[","D","[","D","[","D","=","=","=","=","=","=","=","[","D","]","D","]","D","]","D","[","D","[","D","[","D"],
    "treeBuilder": [
      {"command": "goto", "pos": {"row": 2, "col": 8}},
      "D",
      "]", "D", "]", "D", "]", "D",
      "[", "D", "[", "D", "[", "D", "[", "D",
      {"command": "goto", "pos": {"row": 2, "col": 2}},
      "D",
      "[", "D",
      "]", "D", "]", "D", "]", "D", "]", "D",
      "[", "D", "[", "D",
      {"command": "offsetBy", "offset": {"row": 8, "col": 0}}
    ]
}

},{}],4:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BinaryTree = require('./binary-tree.js');
var Tiles = require('./tiles.js');

var moveNav = {
  'L': 0,
  'R': 1
};

var LetterTree = function () {
  function LetterTree(input) {
    _classCallCheck(this, LetterTree);

    this.tree = new BinaryTree(input);
    this.tiles = new Tiles(input);
    this.currNode = 1;
    var rootNodeTiles = this.findTilesForNode(this.currNode);
    this.currTile = rootNodeTiles[0]; // should be tree root
  }

  _createClass(LetterTree, [{
    key: 'getCurrTile',
    value: function getCurrTile() {
      console.log(this.currTile);
      return this.tiles.tiles[this.currTile.row][this.currTile.col];
    }
  }, {
    key: 'findTilesForNode',
    value: function findTilesForNode(nodeId) {
      return this.tiles.tiles.reduce(function (a, b) {
        return a.concat(b);
      }) // flatten
      .filter(function (t) {
        return t.n === nodeId;
      });
    }

    // move to T fork or leaf

  }, {
    key: 'go',
    value: function go(direction) {
      var currNodeId = this.currTile.n;
      var nextNodeId = void 0;
      if (direction === 'L' || direction === 'R') {
        nextNodeId = this.tree.graph[currNodeId][moveNav[direction]];
      } else if (direction === 'U') {
        nextNodeId = this.tree.parentOf(currNodeId);
      }
      var nextTerminalTileArr = this.tiles.asFlatArray().filter(function (t) {
        return t.n === nextNodeId && (t.p === 'T' || t.p === 'A');
      });

      if (nextTerminalTileArr.length > 0) {
        this.currTile = nextTerminalTileArr[0];
      }
    }
  }, {
    key: 'branchOut',
    value: function branchOut(tile) {
      var nodeId = tile.n;
      var newLeaves = this.tree.branchOut(nodeId);
      var leafTiles = [this.tiles.createEmptyTile({ row: tile.row, col: tile.col - 1 }), this.tiles.createEmptyTile({ row: tile.row + 1, col: tile.col - 1 }), this.tiles.createEmptyTile({ row: tile.row, col: tile.col + 1 }), this.tiles.createEmptyTile({ row: tile.row + 1, col: tile.col + 1 })];
      leafTiles[0].p = 'L';
      leafTiles[1].p = 'A';
      leafTiles[1].l = tile.l; // transfer letter over
      leafTiles[2].p = 'R';
      leafTiles[3].p = 'A';

      var conflicts = [];

      // check dimensions of board
      leafTiles.forEach(function (t) {
        if (t.row >= this.tiles.dim.rows) {
          this.tiles.expandGrid('D');
        }
        if (t.col >= this.tiles.dim.cols) {
          this.tiles.expandGrid('R');
        }
        if (t.col < 0) {
          this.tiles.expandGrid('L');
          // move new tiles over
          leafTiles.forEach(function (tt) {
            return tt.col++;
          });
        }
      }, this);

      if (newLeaves.length > 0) {
        tile.p = 'T';
        tile.l = ''; // remove l from old alpha node, which is now a T node
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
        if (conflicts.length === 0) {
          // insert into tiles
          leafTiles.forEach(function (leaf) {
            var r = leaf.row;
            var c = leaf.col;
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

  }, {
    key: 'branchTiles',
    value: function branchTiles(nodeId) {
      var branch = this.tree.branchOf(nodeId);
      return this.tiles.asFlatArray().map(function (t) {
        return t.n;
      }).filter(function (n) {
        return branch.includes(n);
      });
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return {
        "graph": this.tree.graph,
        "tiles": this.tiles.tiles
      };
    }
  }, {
    key: 'setCurrNodeTile',
    value: function setCurrNodeTile(tile) {
      this.currNode = tile.n;
      this.currTile = tile;
    }
  }, {
    key: 'setLetter',
    value: function setLetter(node, letter) {
      var letterTileArr = this.tiles.asFlatArray().filter(function (t) {
        return t.n === node && t.p === 'A';
      });
      var letterTile = void 0;
      if (letterTileArr.length > 0) {
        letterTile = letterTileArr[0];
        letterTile.l = letter;
      }
    }
  }, {
    key: 'setLetterInFirstEmptyLeaf',
    value: function setLetterInFirstEmptyLeaf(letter) {
      var letterTileArr = this.tiles.asFlatArray().filter(function (t) {
        return (typeof t.l === 'undefined' || t.l === null) && t.p === 'A';
      });
      var letterTile = void 0;
      if (letterTileArr.length > 0) {
        letterTile = letterTileArr[0];
        letterTile.l = letter;
      }
      return letterTile;
    }
  }, {
    key: 'hasLetter',
    value: function hasLetter(letter) {
      var letterTileArr = this.tiles.asFlatArray().filter(function (t) {
        return t.l === letter && t.p === 'A';
      });
      if (letterTileArr.length > 0) {
        return letterTileArr[0].n;
      } else {
        return false;
      }
    }
  }, {
    key: 'encodeLetter',
    value: function encodeLetter(letter) {
      var letterNode = this.hasLetter(letter);
      var letterPath = this.board.tree.pathToRoot(letterNode);
      return letterPath;
    }
  }, {
    key: 'duplicateTile',
    value: function duplicateTile(t) {
      return {
        row: t.row,
        col: t.col,
        p: t.p,
        n: t.n,
        l: t.l
      };
    }
  }, {
    key: 'tilesToRender',
    value: function tilesToRender() {
      var tiles = this.tiles.tiles.slice(); // shallow copy
      var path = [];
      if (this.currTile.n) {
        path = this.tree.pathToRoot(this.currTile.n);
      }
      for (var row = 0; row < this.tiles.dim.rows; row++) {
        for (var col = 0; col < this.tiles.dim.cols; col++) {
          tiles[row][col] = this.duplicateTile(tiles[row][col]);
          tiles[row][col].isCurrTile = false;
          tiles[row][col].isInPath = false;
          if (path.includes(tiles[row][col].n)) {
            tiles[row][col].isInPath = true;
          }
        }
      }
      // set currTile
      tiles[this.currTile.row][this.currTile.col].isCurrTile = true;
      return tiles;
    }
  }]);

  return LetterTree;
}();

module.exports = LetterTree;

},{"./binary-tree.js":2,"./tiles.js":5}],5:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tiles = function () {
  function Tiles(input) {
    _classCallCheck(this, Tiles);

    this.tiles = input.tiles;
    this.dim = { rows: input.tiles.length, cols: input.tiles[0].length };
    // add col and row keys to each tiles
    for (var i = 0; i < this.dim.rows; i++) {
      for (var j = 0; j < this.dim.cols; j++) {
        this.tiles[i][j].row = i;
        this.tiles[i][j].col = j;
      }
    }
  }

  _createClass(Tiles, [{
    key: 'asFlatArray',
    value: function asFlatArray() {
      return this.tiles.reduce(function (a, b) {
        return a.concat(b);
      });
    }
  }, {
    key: 'createEmptyTile',
    value: function createEmptyTile(loc) {
      return {
        p: 'E',
        row: loc.row,
        col: loc.col,
        n: 0
      };
    }
  }, {
    key: 'moveAllTiles',
    value: function moveAllTiles(direction) {
      var allTiles = this.asFlatArray().filter(function (t) {
        return t.p !== 'E';
      });
      console.log(allTiles);
      this.moveTiles(allTiles, direction);
    }

    // tiles is a flat array of all tiles to copy

  }, {
    key: 'moveTiles',
    value: function moveTiles(tiles, direction) {
      var _this = this;

      // TODO: implement 'D' direction
      if (direction === 'R') {
        // move right
        // move row by row, highest col to lowest
        var leftovers = tiles.slice(); // shallow copy of all tiles to copy

        var _loop = function _loop() {
          var t = leftovers[0]; // choose one at random
          var row = leftovers.filter(function (tt) {
            return tt.row === t.row;
          }); // get its row
          row.sort(function (a, b) {
            return a.col - b.col;
          }); // make sure the row is in order
          row.reverse(); // take the reverse order to start from the right
          row.forEach(function (tt) {
            _this.tiles[tt.row][tt.col + 1] = tt;
            _this.tiles[tt.row][tt.col] = _this.createEmptyTile({ row: tt.row, col: tt.col }); // could just do this at the end.
            tt.col = tt.col + 1; // correct the location for the tile
          });

          leftovers = leftovers.filter(function (tt) {
            return tt.row !== t.row;
          }); // the rest will be worked on later
        };

        while (leftovers.length > 0) {
          _loop();
        }
      }
      return tiles;
    }
  }, {
    key: 'detectBorder',
    value: function detectBorder(tiles, direction) {
      var _this2 = this;

      var border = [];
      if (direction === 'R') {
        var leftovers = tiles.slice();

        var _loop2 = function _loop2() {
          var t = leftovers[0]; // choose one at random
          var tilesInThisRow = leftovers.filter(function (tt) {
            return tt.row === t.row;
          }); // get its row
          //find it's max col...hat is the rightmost of the row
          var rightmostCol = Math.max.apply(null, tilesInThisRow.map(function (tt) {
            return tt.col;
          }));
          border.push(_this2.tiles[t.row][rightmostCol]);
          leftovers = leftovers.filter(function (tt) {
            return tt.row !== t.row;
          });
        };

        while (leftovers.length > 0) {
          _loop2();
        }
      }
      if (direction === 'D') {
        // lower border "Down" (lower on the chart tile is a higher number)
        var _leftovers = tiles.slice();

        var _loop3 = function _loop3() {
          var t = _leftovers[0]; // choose one at random
          var tilesInThisCol = _leftovers.filter(function (tt) {
            return tt.col === t.col;
          }); // get its col 
          //find it's max row...that is the lowermost of the col
          var downmostRow = Math.max.apply(null, tilesInThisCol.map(function (tt) {
            return tt.row;
          }));
          border.push(_this2.tiles[downmostRow][t.col]);
          _leftovers = _leftovers.filter(function (tt) {
            return tt.col !== t.col;
          });
        };

        while (_leftovers.length > 0) {
          _loop3();
        }
      }
      return border;
    }
  }, {
    key: 'detectConflicts',
    value: function detectConflicts(tiles) {
      var conflicts = [];
      for (var i = 0; i < tiles.length; i++) {
        var _t = tiles[i];
        // be careful, we don't go over the edge of the array!
        if (_t.row >= this.dim.rows || _t.row < 0 || _t.col >= this.dim.cols || _t.col < 0) {
          return false;
        }
        var tt = this.tiles[_t.row][_t.col];
        if (tt.p !== 'E') {
          // if not empty, it is a conflict
          conflicts.push(tt);
        }
      }
      return conflicts;
    }

    // return [] if no conflicts
    // return false if out of bounds
    // return array of conflict nodes if there are conflicts with other tiles

  }, {
    key: 'detectMoveConflicts',
    value: function detectMoveConflicts(tiles, direction) {
      var conflicts = [];
      var move = { row: 0, col: 0 };
      if (direction === 'R') {
        move = { row: 0, col: 1 };
      } else if (direction === 'D') {
        move = { row: 1, col: 0 };
      }
      var border = this.detectBorder(tiles, direction);
      // check right
      for (var i = 0; i < border.length; i++) {
        var _t2 = border[i];
        // be careful, we don't go over the edge of the array!
        var neighborRow = _t2.row + move.row;
        var neighborCol = _t2.col + move.col;
        if (neighborRow >= this.dim.rows || neighborRow < 0 || neighborCol >= this.dim.cols || neighborCol < 0) {
          return false;
        }
        var neighborTile = this.tiles[neighborRow][neighborCol];
        if (neighborTile.p !== 'E') {
          // if not empty, it is a conflict
          conflicts.push(neighborTile);
        }
      }
      return conflicts;
    }
  }, {
    key: 'expandGrid',
    value: function expandGrid(direction, amount) {
      amount = 1 || amount;
      if (direction === 'D') {
        var newRow = [];
        var newRowId = this.dim.rows;
        for (var i = 0; i < this.dim.cols; i++) {
          var newTile = this.createEmptyTile({ row: newRowId, col: i });
          newRow.push(newTile);
        }
        this.tiles.push(newRow);
        this.dim.rows = this.tiles.length;
      } else if (direction === 'R') {
        for (var _i = 0; _i < this.dim.rows; _i++) {
          var newColId = this.dim.cols;
          var _newTile = this.createEmptyTile({ row: _i, col: newColId });
          this.tiles[_i].push(_newTile);
        }
        this.dim.cols = this.tiles[0].length;
      } else if (direction === 'L') {
        this.expandGrid('R');
        this.moveTiles(this.asFlatArray().filter(function (t) {
          return t.p !== 'E';
        }), 'R'); // move all non empty tiles left
      }
    }
  }]);

  return Tiles;
}();

module.exports = Tiles;

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TreeBuilder = function () {
  function TreeBuilder(board, commands) {
    _classCallCheck(this, TreeBuilder);

    this.board = board;
    this.commands = commands;
    this.count = 0;
    this.offsets = { row: 0, col: 0 };
    this.currIndex = 0;
  }

  _createClass(TreeBuilder, [{
    key: 'insertLetter',
    value: function insertLetter(letter, node) {
      if (node) {} else if (!node && !this.board.hasLetter(letter)) {
        var letterTile = this.board.setLetterInFirstEmptyLeaf(letter);
        if (typeof letterTile === 'undefined') {
          this.nextBuildOut();
          letterTile = this.board.setLetterInFirstEmptyLeaf(letter);
        }
      }
    }
  }, {
    key: 'nextInCommandArray',
    value: function nextInCommandArray() {
      if (this.currIndex >= this.commands.length) {
        this.currIndex = 0;
      }
      return this.commands[this.currIndex++];
    }
  }, {
    key: 'nextBuildOut',
    value: function nextBuildOut() {
      var next = '';
      while (next !== 'D') {
        next = this.nextCommand();
        if (typeof next.command === 'undefined') {
          this.commandTree(next);
        } else if (next.command === 'goto') {
          var t = this.board.tiles.tiles[next.pos.row][next.pos.col];
          this.board.setCurrNodeTile(t);
        }
      }
    }
  }, {
    key: 'commandTree',
    value: function commandTree(command) {
      var next = command;
      if (next === ']' || next === '[') {
        if (next === '[') {
          this.board.go('L');
        } else if (next === ']') {
          this.board.go('R');
        }
      } else if (next === 'D') {
        this.board.branchOut(this.board.tiles.tiles[this.board.currTile.row][this.board.currTile.col]);
      }
    }
  }, {
    key: 'nextCommand',
    value: function nextCommand() {
      var next = this.nextInCommandArray();

      while (next.command === 'offsetBy') {
        this.offsets.row += next.offset.row;
        this.offsets.col += next.offset.col;
        next = this.nextInCommandArray();
      }

      if (next.command === 'goto') {
        return {
          command: 'goto',
          pos: {
            row: next.pos.row + this.offsets.row,
            col: next.pos.col + this.offsets.col
          }
        };
      } else {
        return next;
      }
    }
  }]);

  return TreeBuilder;
}();

module.exports = TreeBuilder;

},{}]},{},[1]);
