import { Document, Model } from 'mongoose';
import _ from 'lodash';
import { Socket } from 'socket.io';
import Utils from '../../Utils';
import { ChatMessage } from '../../Utils/Interfaces';
import { ParserResult, Payload } from '../../Utils/Types';
import { createRealRoom, updateFakeRoom } from './Chat.utils';
import WebSocketWorker from '../WebSocketWorker';

const { getModelByName } = Utils;

export const newMessageEvent = (socket: Socket) => async (msgObj: ChatMessage) => {
  const { tokenRoom = '' } = msgObj || {};
  try {
    const model: Model<Document> | null = getModelByName('chatMsg', 'chatMsg');

    if (model && tokenRoom) {
      socket.join(tokenRoom);
      const { displayName = '' } = msgObj;
      if (msgObj && typeof msgObj === 'object' && displayName !== 'System') {
        const saveMsg = await model.create(msgObj as object);

        if (!saveMsg) throw new TypeError('Bad msg object');
        console.log('tokenRoom:', tokenRoom);

        (process as any).send({
          action: 'emitSocket',
          payload: {
            event: 'msg',
            to: tokenRoom,
            data: saveMsg,
          },
        });
      } else {
        (process as any).send({
          action: 'emitSocket',
          payload: {
            event: 'msg',
            to: tokenRoom,
            data: msgObj,
          },
        });
      }
    } else throw new TypeError('Error save message');
  } catch (err) {
    console.error(err.message);
  }
};

export const initFakeRoomEvent = (socket: Socket) => async (fakeData: Record<string, string | object>) => {
  const { fakeMsg = {}, interlocutorId = '' } = fakeData || {};

  if (!_.isEmpty(fakeMsg) && interlocutorId) {
    const result: ParserResult = await createRealRoom(
      fakeMsg as Record<string, object>,
      interlocutorId as string,
    );

    if (result) {
      updateFakeRoom(socket)(result, fakeMsg as Record<string, object>);
    }
  }
};

export const initChatRoomEvent = (socket: Socket) => ({ token: tokenRoom = '' }) => {
  if (!tokenRoom) {
    console.error('tokenRoom is undefiend');
    return;
  }

  socket.join(tokenRoom);

  (process as any).send({
    action: 'emitSocket',
    payload: {
      event: 'joinMsg',
      to: tokenRoom,
      data: {
        displayName: 'System',
      },
    },
  });
};

export const workerDisconnect = (socket: Socket) => {
  console.log(socket.eventNames);
  console.log('user disconnected');
};

export const processMessageEvent = (ws: WebSocketWorker) => (
  data: Record<string, object | string | null>,
) => {
  try {
    console.log('process message', data);
    const { action = '', payload = {} } = data;

    switch (action) {
      case 'emitSocket': {
        const { event = '', data = {}, to = '', socket = null } = payload as Record<string, Payload>;
        let worker = ws.getWorker();
        if (to && to === 'broadcast' && socket) {
          (socket as Socket).broadcast.emit(event as string, data);
          break;
        }

        if (to) {
          worker.to(to as string).emit(event as string, data);
          break;
        }

        worker.emit(event as string, data);
        break;
      }

      default: {
        console.warn('No router process');
      }
    }
  } catch (err) {
    console.error(err);
  }
};
