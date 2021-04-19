import { Socket } from 'socket.io';
import { ChatModel } from '../../Utils/Interfaces/Interfaces.global';
import WebSocketWorker from '../WebSocketWorker';
import { initFakeRoomEvent, newMessageEvent, workerDisconnect } from './Chat.events';
import { Payload } from '../../Utils/Types/types.global';
import { PROCESS_ACTIONS, PROCESS_CHAT_EVENTS } from './Chat.constant';

class Chat implements ChatModel {
  private _ws: WebSocketWorker;

  constructor(ws: WebSocketWorker) {
    // eslint-disable-next-line no-underscore-dangle
    this._ws = ws;
  }

  get ws() {
    // eslint-disable-next-line no-underscore-dangle
    return this._ws;
  }

  private processMessageEvent(data: Record<string, Record<string, any> | string | null>): void {
    const { action = '', payload = {} } = data;

    try {
      if (action !== PROCESS_ACTIONS.CHAT_PROCESS_MESSAGE_ACTION) {
        console.log(action);
        console.warn('No router process');
        return;
      }

      const { event = '', data: dataValues = {}, to = '', socket = null } = payload as Record<
        string,
        Payload
      >;
      const worker = this.ws.getWorker();

      if (to && to === 'broadcast' && socket) {
        (socket as Socket).broadcast.emit(event as string, dataValues);
        return;
      }

      if (to) {
        worker.to(to as string).emit(event as string, dataValues);
        return;
      }

      worker.emit(event as string, dataValues);
    } catch (err) {
      console.error(err);
    }
  }

  private registerEventsListeners(socket: Socket): void {
    socket.emit('connection', true);

    socket.on(PROCESS_CHAT_EVENTS.CHAT_MESSAGE_EVENT, newMessageEvent(socket));
    socket.on(PROCESS_CHAT_EVENTS.INITIAL_FAKE_ROOM, initFakeRoomEvent(socket));
    socket.on(PROCESS_CHAT_EVENTS.ACTIVATE_CHAT_ROOM_EVENT, initFakeRoomEvent(socket));
    process.on('message', this.processMessageEvent.bind(this));
  }

  public run(): void {
    const worker = this.ws.getWorker();
    if (!worker) {
      throw new Error('Worker in Chat not found');
    }

    worker.on(PROCESS_CHAT_EVENTS.CONNECTION_EVENT, this.registerEventsListeners.bind(this));
    worker.on(PROCESS_CHAT_EVENTS.DISCONNECT_EVENT, workerDisconnect.bind(this));
  }

  public destroy(socket: Socket): void {
    socket.off(PROCESS_CHAT_EVENTS.CHAT_MESSAGE_EVENT, newMessageEvent(socket));
    socket.off(PROCESS_CHAT_EVENTS.INITIAL_FAKE_ROOM, initFakeRoomEvent(socket));
    socket.off(PROCESS_CHAT_EVENTS.ACTIVATE_CHAT_ROOM_EVENT, initFakeRoomEvent(socket));
  }
}

export default Chat;
