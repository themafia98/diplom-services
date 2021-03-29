import { Document, Model } from 'mongoose';
import _ from 'lodash';
import { Socket } from 'socket.io';
import { getModelByName } from '../../Utils/utils.global';
import { ChatMessage } from '../../Utils/Interfaces/Interfaces.global';
import { ParserResult } from '../../Utils/Types/types.global';
import { createRealRoom, updateFakeRoom } from './Chat.utils';
import { CHAT_ROBOT_NAME, PROCESS_ACTIONS, PROCESS_CHAT_EVENTS } from './Chat.constant';
import { ENTITY } from '../Database/Schema/Schema.constant';

export const newMessageEvent = (socket: Socket) => async (msgObj: ChatMessage) => {
  const { tokenRoom = '' } = msgObj || {};
  try {
    const model: Model<Document> | null = getModelByName(ENTITY.CHAT_MESSAGE, ENTITY.CHAT_MESSAGE);

    if (model && tokenRoom) {
      socket.join(tokenRoom);

      const { displayName = '' } = msgObj;
      const isNewUserMessage = msgObj && typeof msgObj === 'object' && displayName !== CHAT_ROBOT_NAME;

      if (!isNewUserMessage) {
        (process as any).send({
          action: PROCESS_ACTIONS.CHAT_PROCESS_MESSAGE_ACTION,
          payload: {
            event: PROCESS_CHAT_EVENTS.MESSAGE,
            to: tokenRoom,
            data: msgObj,
          },
        });

        return;
      }

      const saveMsg = await model.create(msgObj as object);

      if (!saveMsg) {
        throw new TypeError('Bad msg object');
      }

      console.log('tokenRoom:', tokenRoom);

      (process as any).send({
        action: PROCESS_ACTIONS.CHAT_PROCESS_MESSAGE_ACTION,
        payload: {
          event: PROCESS_CHAT_EVENTS.MESSAGE,
          to: tokenRoom,
          data: saveMsg,
        },
      });

      return;
    }

    throw new TypeError('Error save message');
  } catch (err) {
    console.error(err.message);
  }
};

export const initFakeRoomEvent = (socket: Socket) => async (fakeData: Record<string, string | object>) => {
  const { fakeMsg = null, interlocutorId = '' } = fakeData || {};

  if (!fakeMsg || _.isEmpty(fakeMsg) || !interlocutorId) {
    return;
  }

  const result: ParserResult = await createRealRoom(
    fakeMsg as Record<string, object>,
    interlocutorId as string,
  );

  if (result) {
    updateFakeRoom(socket)(result, fakeMsg as Record<string, object>);
  }
};

export const initChatRoomEvent = (socket: Socket) => ({ token: tokenRoom = '' }) => {
  if (!tokenRoom) {
    console.error('tokenRoom is undefiend');
    return;
  }

  socket.join(tokenRoom);

  (process as any).send({
    action: PROCESS_ACTIONS.CHAT_PROCESS_MESSAGE_ACTION,
    payload: {
      event: PROCESS_CHAT_EVENTS.JOIN_MESSAGE,
      to: tokenRoom,
      data: {
        displayName: CHAT_ROBOT_NAME,
      },
    },
  });
};

export const workerDisconnect = (socket: Socket) => {
  console.log(socket.eventNames);
  console.log('user disconnected');
};
