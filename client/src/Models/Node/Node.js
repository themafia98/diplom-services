// @ts-nocheck
import { createPortal } from 'react-dom';

class Node {
  /** portal element */
  #portal;
  /** container for portal */
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

  create(children) {
    return createPortal(children, this.container);
  }
}

export default Node;
