interface SSNode extends Node {
  ssIgnoreChild?: boolean;
  ssIsEndNode?: boolean;
}
/**
 *
 * travel from one TEXT_NODE to another
 */
const text2text = (
  startNode: Text,
  endNode: Text,
  commonAncestor: Node,
  onTransition: (node: Node) => Node | void
) => {
  transition(startNode, endNode, commonAncestor, onTransition, null);
};

/**
 * there are three actions possible
 * nextSibling - return next childNode or null
 * firstChildNode - return first childNode or null
 * parent's nextSibling until not null
 *
 * all actions return either the new node or null
 */
const nextSibling = (node: Node): Node | null => {
  if (node.nextSibling) return node.nextSibling;
  else return null;
};

const firstChildNode = (node: Node): Node | null => {
  if (node.childNodes.length > 0) return node.childNodes[0];
  else return null;
};

const firstAncestorNotNullSibling = (node: Node): Node | null => {
  let ancestor = node.parentNode;
  if (ancestor.nextSibling) {
    return ancestor.nextSibling;
  } else {
    return firstAncestorNotNullSibling(ancestor);
  }
};

/**
 *
 * walks DOM including from currentNode to endNode
 * children of currentNode will be included
 * children of endNode will be excluded
 *
 */
const NEXT_SIBLING = 1;
const FIRST_CHILD = 2;
const LAST_CHILD = 3;
/**
 *
 * if onTransition mutates the tree, then it must return new currentNode
 */

const transition = (
  currentNode: SSNode,
  endNode: SSNode,
  commonAncestor: SSNode,
  onTransition: (node: SSNode, prevNode: Node | null) => SSNode | void,
  prevNode: SSNode | null
) => {
  // clean the attach field
  delete currentNode.ssIgnoreChild;

  let newNode = onTransition(currentNode, prevNode);
  if (newNode) {
    newNode.ssIgnoreChild = true;
    if (currentNode == endNode) {
      newNode.ssIsEndNode = true;
    }
    currentNode = newNode;
  }
  if (currentNode == endNode || currentNode.ssIsEndNode) {
    // clean the attach field
    delete currentNode.ssIsEndNode;
    delete currentNode.ssIgnoreChild;

    return;
  }
  let nextNode: Node | null;
  if (currentNode.childNodes.length == 0 || currentNode.ssIgnoreChild) {
    nextNode = nextSibling(currentNode);
    if (nextNode) {
      transition(nextNode, endNode, commonAncestor, onTransition, currentNode);
      return;
    }
    nextNode = firstAncestorNotNullSibling(currentNode);
    if (nextNode == commonAncestor) {
      // clean the attach field
      delete currentNode.ssIgnoreChild;

      throw new Error("commonAncestor is nextNode");
    }
    if (nextNode) {
      transition(nextNode, endNode, commonAncestor, onTransition, currentNode);
      return;
    }
  } else {
    nextNode = firstChildNode(currentNode);
    if (nextNode) {
      transition(nextNode, endNode, commonAncestor, onTransition, currentNode);
      return;
    } else {
      throw new Error(
        "no childNode, but atleast one expected. DOM might have changed"
      );
    }
  }
};
