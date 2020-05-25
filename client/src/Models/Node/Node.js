import { createPortal } from 'react-dom';

class Node {
  /**
   * portal element
   * @type {HTMLElement}
   * */
  #portal;
  /**
   * container for portal
   * @type {HTMLElement}
   * */
  #container;

  constructor(element, containerClassName) {
    this.#container = document.querySelector(`.${containerClassName}`);
    this.#portal = document.createElement(element);
  }

  get portal() {
    return this.#portal;
  }

  get container() {
    return this.#container;
  }

  append() {
    this.container.appendChild(this.portal);
  }

  remove() {
    this.container.removeChild(this.portal);
  }

  /**
   *
   * @param {PureComponent |Component | JsxElement} children
   */
  create(children) {
    return createPortal(children, this.container);
  }
}

export default Node;
