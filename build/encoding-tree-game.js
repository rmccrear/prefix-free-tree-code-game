(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
  try {
    cachedSetTimeout = setTimeout;
  } catch (e) {
    cachedSetTimeout = function () {
      throw new Error('setTimeout is not defined');
    }
  }
  try {
    cachedClearTimeout = clearTimeout;
  } catch (e) {
    cachedClearTimeout = function () {
      throw new Error('clearTimeout is not defined');
    }
  }
} ())
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = cachedSetTimeout.call(null, cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    cachedClearTimeout.call(null, timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        cachedSetTimeout.call(null, drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
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
"use strict";

var LetterTree = require('./letter-tree.js');
var TileTextRenderer = require('./tile-text-renderer.js');
var TreeBuilder = require('./tree-builder.js');

},{"./letter-tree.js":4,"./tile-text-renderer.js":12,"./tree-builder.js":14}],4:[function(require,module,exports){
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
          console.log('expand down');
          this.tiles.expandGrid('D');
        }
        if (t.col >= this.tiles.dim.cols) {
          console.log('expand right');
          this.tiles.expandGrid('R');
        }
        if (t.col < 0) {
          console.log('expand left');
          console.log(this.tiles.tiles);
          this.tiles.expandGrid('L');
          // move new tiles over
          console.log(this.tiles.tiles);
          leafTiles.forEach(function (tt) {
            return tt.col++;
          });
        }
      }, this);

      if (newLeaves.length > 0) {
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
      var letterNode = this.hasLetter();
      var letterPath = this.board.tree.pathToRoot(letterNode);
      return letterPath;
    }
  }]);

  return LetterTree;
}();

module.exports = LetterTree;

},{"./binary-tree.js":2,"./tiles.js":13}],5:[function(require,module,exports){
'use strict';
module.exports = function () {
	return /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
};

},{}],6:[function(require,module,exports){
'use strict';

function assembleStyles () {
	var styles = {
		modifiers: {
			reset: [0, 0],
			bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		colors: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],
			gray: [90, 39]
		},
		bgColors: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49]
		}
	};

	// fix humans
	styles.colors.grey = styles.colors.gray;

	Object.keys(styles).forEach(function (groupName) {
		var group = styles[groupName];

		Object.keys(group).forEach(function (styleName) {
			var style = group[styleName];

			styles[styleName] = group[styleName] = {
				open: '\u001b[' + style[0] + 'm',
				close: '\u001b[' + style[1] + 'm'
			};
		});

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	});

	return styles;
}

Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});

},{}],7:[function(require,module,exports){
(function (process){
'use strict';
var escapeStringRegexp = require('escape-string-regexp');
var ansiStyles = require('ansi-styles');
var stripAnsi = require('strip-ansi');
var hasAnsi = require('has-ansi');
var supportsColor = require('supports-color');
var defineProps = Object.defineProperties;
var isSimpleWindowsTerm = process.platform === 'win32' && !/^xterm/i.test(process.env.TERM);

function Chalk(options) {
	// detect mode if not set manually
	this.enabled = !options || options.enabled === undefined ? supportsColor : options.enabled;
}

// use bright blue on Windows as the normal blue color is illegible
if (isSimpleWindowsTerm) {
	ansiStyles.blue.open = '\u001b[94m';
}

var styles = (function () {
	var ret = {};

	Object.keys(ansiStyles).forEach(function (key) {
		ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');

		ret[key] = {
			get: function () {
				return build.call(this, this._styles.concat(key));
			}
		};
	});

	return ret;
})();

var proto = defineProps(function chalk() {}, styles);

function build(_styles) {
	var builder = function () {
		return applyStyle.apply(builder, arguments);
	};

	builder._styles = _styles;
	builder.enabled = this.enabled;
	// __proto__ is used because we must return a function, but there is
	// no way to create a function with a different prototype.
	/* eslint-disable no-proto */
	builder.__proto__ = proto;

	return builder;
}

function applyStyle() {
	// support varags, but simply cast to string in case there's only one arg
	var args = arguments;
	var argsLen = args.length;
	var str = argsLen !== 0 && String(arguments[0]);

	if (argsLen > 1) {
		// don't slice `arguments`, it prevents v8 optimizations
		for (var a = 1; a < argsLen; a++) {
			str += ' ' + args[a];
		}
	}

	if (!this.enabled || !str) {
		return str;
	}

	var nestedStyles = this._styles;
	var i = nestedStyles.length;

	// Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
	// see https://github.com/chalk/chalk/issues/58
	// If we're on Windows and we're dealing with a gray color, temporarily make 'dim' a noop.
	var originalDim = ansiStyles.dim.open;
	if (isSimpleWindowsTerm && (nestedStyles.indexOf('gray') !== -1 || nestedStyles.indexOf('grey') !== -1)) {
		ansiStyles.dim.open = '';
	}

	while (i--) {
		var code = ansiStyles[nestedStyles[i]];

		// Replace any instances already present with a re-opening code
		// otherwise only the part of the string until said closing code
		// will be colored, and the rest will simply be 'plain'.
		str = code.open + str.replace(code.closeRe, code.open) + code.close;
	}

	// Reset the original 'dim' if we changed it to work around the Windows dimmed gray issue.
	ansiStyles.dim.open = originalDim;

	return str;
}

function init() {
	var ret = {};

	Object.keys(styles).forEach(function (name) {
		ret[name] = {
			get: function () {
				return build.call(this, [name]);
			}
		};
	});

	return ret;
}

defineProps(Chalk.prototype, init());

module.exports = new Chalk();
module.exports.styles = ansiStyles;
module.exports.hasColor = hasAnsi;
module.exports.stripColor = stripAnsi;
module.exports.supportsColor = supportsColor;

}).call(this,require('_process'))
},{"_process":1,"ansi-styles":6,"escape-string-regexp":9,"has-ansi":10,"strip-ansi":11,"supports-color":8}],8:[function(require,module,exports){
(function (process){
'use strict';
var argv = process.argv;

var terminator = argv.indexOf('--');
var hasFlag = function (flag) {
	flag = '--' + flag;
	var pos = argv.indexOf(flag);
	return pos !== -1 && (terminator !== -1 ? pos < terminator : true);
};

module.exports = (function () {
	if ('FORCE_COLOR' in process.env) {
		return true;
	}

	if (hasFlag('no-color') ||
		hasFlag('no-colors') ||
		hasFlag('color=false')) {
		return false;
	}

	if (hasFlag('color') ||
		hasFlag('colors') ||
		hasFlag('color=true') ||
		hasFlag('color=always')) {
		return true;
	}

	if (process.stdout && !process.stdout.isTTY) {
		return false;
	}

	if (process.platform === 'win32') {
		return true;
	}

	if ('COLORTERM' in process.env) {
		return true;
	}

	if (process.env.TERM === 'dumb') {
		return false;
	}

	if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
		return true;
	}

	return false;
})();

}).call(this,require('_process'))
},{"_process":1}],9:[function(require,module,exports){
'use strict';

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

module.exports = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(matchOperatorsRe,  '\\$&');
};

},{}],10:[function(require,module,exports){
'use strict';
var ansiRegex = require('ansi-regex');
var re = new RegExp(ansiRegex().source); // remove the `g` flag
module.exports = re.test.bind(re);

},{"ansi-regex":5}],11:[function(require,module,exports){
'use strict';
var ansiRegex = require('ansi-regex')();

module.exports = function (str) {
	return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
};

},{"ansi-regex":5}],12:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var chalk = require('chalk');

var glyphs = {
  'E': ' ',
  'T': '┻',
  'R': '┓',
  'L': '┏',
  'A': '╍',
  'H': '─',
  'V': '┃'
};

var TileTextRenderer = function () {
  function TileTextRenderer() {
    _classCallCheck(this, TileTextRenderer);
  }

  _createClass(TileTextRenderer, null, [{
    key: 'print',
    value: function print(board) {
      var tiles = board.tiles.tiles;
      var colNumbers = ['  '];
      var rowLen = tiles.length;
      var colLen = tiles[0].length;
      var output = [];
      for (var i = 0; i < colLen; i++) {
        colNumbers.push(i);
      }
      // console.log(colNumbers.join(''));
      output.push(colNumbers);
      for (var _i = 0; _i < rowLen; _i++) {
        var row = [_i];
        var tilesInRow = tiles[_i].map(function (tile) {
          if (tile.p === 'A') {
            if (typeof tile.l !== 'undefined') return tile.l;else return '?';
          } else {
            return glyphs[tile.p];
          }
        });
        output.push([_i + ' '].concat(tilesInRow));
        // console.log(i + ' ' + tilesInRow.join(''));
      }
      var cR = board.currTile.row + 1; // these offsets are the result of adding guide numbers to the first row and col
      var cC = board.currTile.col + 1; // these offsets are the result of adding guide numbers to the first row and col
      output[cR][cC] = chalk.red(output[cR][cC]);
      for (var _i2 = 0; _i2 < output.length; _i2++) {
        console.log(output[_i2].join(''));
      }
    }
  }]);

  return TileTextRenderer;
}();

module.exports = TileTextRenderer;

},{"chalk":7}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}]},{},[3]);
