"use strict";

class BinaryTree {
  constructor(input, digits) {
    this.graph = input.graph;
    //this.leafData = input.leafData;
    this.root = 1;
    this.digits = digits || ["L", "R"];
  }

  branchOut(leafNode) {
    if (this.isLeaf(leafNode)) {
      const nextIds = [this.graph.length, this.graph.length + 1];
      this.graph[leafNode] = nextIds;
      // add two leaf nodes to the graph
      this.graph.push([]);
      this.graph.push([]);
      return nextIds;
    } else {
      return [];
    }
  }

  isLeaf(node) {
    console.log(node);
    return this.graph[node].length === 0;
  }

  // get branch starting at node
  branchOf(node) {
    let branchNodes = [node]; // initial step
    for (let i = 0; i < this.graph[node].length; i++) {
      branchNodes = branchNodes.concat(this.branchOf(this.graph[node][i]));
    }
    return branchNodes;
  }

  // get parent of node
  parentOf(node) {
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

  pathToRoot(node) {
    let n = node;
    let path = [];
    while (n !== this.root) {
      path.push(n);
      n = this.parentOf(n);
    }
    path.push(this.root);
    return path;
  }

  encodingOf(node) {
    let n = node;
    let code = [];
    while (n && n !== this.root) {
      const direction = this.branchDirectionOf(n);
      code.push(direction);
      n = this.parentOf(n);
    }
    code.reverse();
    return code;
  }

  commonAncestorOf(node1, node2) {
    let path1 = this.pathToRoot(node1);
    let path2 = this.pathToRoot(node2);

    let commonAncestor = this.root;
    let n1 = path1.pop();
    let n2 = path2.pop();

    while (n1 !== undefined && n2 !== undefined && n1 === n2) {
      commonAncestor = n1; // === n2
      n1 = path1.pop(); // if no more in stack, its undefined
      n2 = path2.pop();
    }
    return commonAncestor;
  }

  branchDirectionOf(node) {
    const parent = this.parentOf(node);
    //    console.log("parent: " + parent)
    //    console.log("parent[0]: " + parent[0])
    if (parent && this.graph[parent][0] === node) {
      return this.digits[0]; // "L" (left)
    } else if (parent && this.graph[parent][1] === node) {
      return this.digits[1]; // "R" (right)
    }
  }
}

// module.exports = BinaryTree;
export default BinaryTree;
