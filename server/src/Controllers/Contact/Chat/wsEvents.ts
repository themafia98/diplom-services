import cluster from 'cluster';
import _ from 'lodash';
import { Socket } from 'socket.io';
import { Model, Document } from 'mongoose';
import WebSocketWorker from '../../../Models/WebSocketWorker';
import Chat from './';
import Utils from '../../../Utils';
import { Server as HttpServer } from 'http';
import { ParserResult, Payload } from '../../../Utils/Types';
import { Dbms, ChatMessage } from '../../../Utils/Interfaces';

export default (ws: WebSocketWorker, dbm: Dbms, server: HttpServer) => {
  const { getModelByName } = Utils;
  const { createRealRoom } = Chat;
  const workerId = cluster.worker.id;
  const worker = ws.getWorker(workerId);

  worker.on('connection', (socket: Socket) => {
    console.log('ws connection');
    socket.emit('connection', true);

    const callbackFakeRoom = (result: ParserResult, fakeMsg: object) => {
      const { tokenRoom = '' } = (result as Record<string, string>) || {};
      socket.join(tokenRoom);
      const response = { room: result, msg: fakeMsg };
      const send: Function = process.send as Function;

      send({
        action: 'emitSocket',
        payload: {
          event: 'updateFakeRoom',
          to: tokenRoom,
          data: response,
        },
      });

      socket.broadcast.emit('updateChatsRooms', {
        ...response,
        fullUpdate: true,
        activeModule: 'chat',
      });
    };

    socket.on('newMessage', async (msgObj: ChatMessage) => {
      const { tokenRoom = '' } = msgObj || {};
      try {
        const model: Model<Document> | null = getModelByName('chatMsg', 'chatMsg');

        if (model && tokenRoom) {
          socket.join(tokenRoom);
          const { displayName = '' } = msgObj;
          if (msgObj && _.isObject(msgObj) && displayName !== 'System') {
            const saveMsg = await model.create(msgObj);

            if (!saveMsg) throw new TypeError('Bad msg object');
            console.log('tokenRoom:', tokenRoom);

            (<any>process).send({
              action: 'emitSocket',
              payload: {
                event: 'msg',
                to: tokenRoom,
                data: saveMsg,
              },
            });
          } else {
            sendProcess({
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
    });

    socket.on('initFakeRoom', async (fakeData: Record<string, string | object>) => {
      const { fakeMsg = {}, interlocutorId = '' } = fakeData || {};

      if (!_.isEmpty(fakeMsg) && interlocutorId) {
        const result: ParserResult = await createRealRoom(
          <Record<string, object>>fakeMsg,
          <string>interlocutorId,
        );

        if (result) {
          console.log('updateFakeRoom', result);
          callbackFakeRoom(result, <Record<string, object>>fakeMsg);
        }
      }
    });

    socket.on('onChatRoomActive', ({ token: tokenRoom, displayName = '' }) => {
      socket.join(tokenRoom);

      (<any>process).send({
        action: 'emitSocket',
        payload: {
          event: 'joinMsg',
          to: tokenRoom,
          data: {
            displayName: 'System',
          },
        },
      });
    });
  });

  worker.on('disconnect', (socket: Socket) => {
    console.log(socket.eventNames);
    console.log('user disconnected');
  });

  process.on('message', (data: Record<string, object | string | null>) => {
    try {
      console.log('process message', data);
      const { action = '', payload = {} } = data;

      switch (action) {
        case 'emitSocket': {
          const { event = '', data = {}, to = '', socket = null } = payload as Record<string, Payload>;
          let worker = ws.getWorker();
          if (to && to === 'broadcast' && socket) {
            (<Socket>socket).broadcast.emit(<string>event, data);
            break;
          }

          if (to) {
            worker.to(<string>to).emit(<string>event, data);
            break;
          }

          worker.emit(<string>event, data);
          break;
        }

        default: {
          console.warn('No router process');
        }
      }
    } catch (err) {
      console.error(err);
    }
  });
};
