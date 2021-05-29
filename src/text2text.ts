/**
 *
 * travel from one TEXT_NODE to another
 */
const text2text = (
  startNode: Text,
  endNode: Text,
  commonAncestor: Node,
  onTransition: (node: Node) => void
) => {
  transition(startNode, endNode, commonAncestor, onTransition);
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
 */
const transition = (
  currentNode: Node,
  endNode: Node,
  commonAncestor: Node,
  onTransition: (node: Node) => void
) => {
  onTransition(currentNode);
  if (currentNode == endNode) {
    return;
  }
  let nextNode: Node | null;
  if (currentNode.childNodes.length == 0) {
    nextNode = nextSibling(currentNode);
    if (nextNode) {
      transition(nextNode, endNode, commonAncestor, onTransition);
      return;
    }
    nextNode = firstAncestorNotNullSibling(currentNode);
    if (nextNode == commonAncestor) {
      throw new Error("commonAncestor is nextNode");
    }
    if (nextNode) {
      transition(nextNode, endNode, commonAncestor, onTransition);
      return;
    }
  } else {
    nextNode = firstChildNode(currentNode);
    if (nextNode) {
      transition(nextNode, endNode, commonAncestor, onTransition);
      return;
    } else {
      throw new Error(
        "no childNode, but atleast one expected. DOM might have changed"
      );
    }
  }
};
