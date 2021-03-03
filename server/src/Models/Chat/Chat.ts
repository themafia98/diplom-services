import { Socket } from 'socket.io';
import _ from 'lodash';
import cluster from 'cluster';
import { ChatModel } from '../../utils/Interfaces/Interfaces.global';
import WebSocketWorker from '../WebSocketWorker';
import { initFakeRoomEvent, newMessageEvent, processMessageEvent, workerDisconnect } from './Chat.events';

class Chat implements ChatModel {
  private _ws: WebSocketWorker;

  constructor(ws: WebSocketWorker) {
    this._ws = ws;
  }

  get ws() {
    return this._ws;
  }

  private registerEventsListeners(socket: Socket): void {
    socket.emit('connection', true);

    socket.on('newMessage', newMessageEvent(socket));
    socket.on('initFakeRoom', initFakeRoomEvent(socket));
    socket.on('onChatRoomActive', initFakeRoomEvent(socket));
    process.on('message', processMessageEvent(this.ws));
  }

  public run(): void {
    const worker = this.ws.getWorker();
    if (!worker) {
      throw new Error('Worker in Chat not found');
    }

    worker.on('connection', this.registerEventsListeners);
    worker.on('disconnect', workerDisconnect);
  }

  public destroy(socket: Socket): void {
    const worker = this.ws.getWorker();
    socket.off('newMessage', newMessageEvent(socket));
    socket.off('initFakeRoom', initFakeRoomEvent(socket));
    socket.off('onChatRoomActive', initFakeRoomEvent(socket));
    worker.off('disconnect', workerDisconnect);
    process.off('message', processMessageEvent(this.ws));
  }
}

export default Chat;
