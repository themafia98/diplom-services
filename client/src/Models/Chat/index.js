

class ChatModel {
    constructor(io) {
        this.socket = io;
    }

    getSocket() {
        return this.socket;
    }

    useDefaultEvents() {
        if (!this.getSocket()) return;

        this.getSocket().on("reconnect_attempt", () => {
            this.socket.io.opts.transports = ["websocket", "polling"];
        });
    }

    reconnectAttempt(rules) {
        this.socket.io.opts.transports = rules;
    }

}

export default ChatModel;