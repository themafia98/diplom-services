class ChatModel {
  /**
   * @private
   */
  #socket;

  constructor(io) {
    this.#socket = io;
  }

  getSocket() {
    return this.#socket;
  }

  useDefaultEvents() {
    if (!this.getSocket()) return;

    this.getSocket().on('reconnect_attempt', () => {
      this.getSocket().io.opts.transports = ['websocket', 'polling'];
    });
  }

  /**
   * @param {any} rules
   */
  reconnectAttempt(rules) {
    this.getSocket().io.opts.transports = rules;
  }
}

export default ChatModel;
