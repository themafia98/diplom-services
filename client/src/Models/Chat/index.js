// @ts-nocheck
class ChatModel {
  /**
   * @private
   * @type {SocketIOClient.Socket}
   */
  #socket;

  /**
   * @param {SocketIOClient.Socket} io
   */
  constructor(io) {
    this.#socket = io;
  }

  getSocket() {
    return this.#socket;
  }

  getStatus() {
    return this.getSocket().connected;
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
