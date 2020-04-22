// @ts-nocheck
class TreeBuilder {
  /**
   * @private
   * @type {Array}
   */
  #childrens = [];

  /**
   * @param {Array} childrens
   * @constructor
   */
  constructor(childrens) {
    this.#childrens = [...childrens];
  }

  /**
   * @public
   */
  get childrens() {
    return this.#childrens;
  }

  /**
   * @public
   * @param {Array<object>} root
   * @param {number} indexRoot default value 0
   */
  buildTree(root, indexRoot = 0) {
    if (!root.length || !root[indexRoot]) return root;

    const currentNode = root[indexRoot];
    const childNodes = this.childrens.filter((child) => child.parentId === currentNode._id);

    currentNode.children = this.buildTree(childNodes);
    return this.buildTree(root, indexRoot + 1);
  }
}

export default TreeBuilder;
