import cluster from 'cluster';
import _ from 'lodash';
import { Socket } from 'socket.io';
import { Model, Document } from 'mongoose';
import WebSocketWorker from '../../../Models/WebSocketWorker';
import Database from '../../../Models/Database';
import Chat from './';
import Utils from '../../../Utils';
import { Server as HttpServer } from 'http';
import { ParserResult } from '../../../Utils/Types';

/**
 * Need upgrade for comunication between workers
 */

export default (ws: WebSocketWorker, dbm: Readonly<Database.ManagmentDatabase>, server: HttpServer) => {
  const { getModelByName } = Utils;
  const { createRealRoom } = Chat;
  const workerId = cluster.worker.id;
  const worker = ws.getWorker(workerId);

  worker.on('connection', (socket: Socket) => {
    console.log('ws connection');
    socket.emit('connection', true);

    const callbackFakeRoom = (result: ParserResult, fakeMsg: object) => {
      const { tokenRoom = '', membersIds = [] } = <Record<string, any>>result || {};
      socket.join(tokenRoom);
      const response = { room: result, msg: fakeMsg };

      (<Record<string, any>>process).send({
        action: 'emitSocket',
        payload: {
          event: 'updateFakeRoom',
          to: tokenRoom,
          data: response,
        },
      });

      // (<Record<string, any>>process).send({
      //     action: "emitSocket",
      //     payload: {
      //         event: "updateChatsRooms",
      //         to: "broadcast",
      //         socket,
      //         data: { ...response, fullUpdate: true, activeModule: "chat" }
      //     }
      // });

      socket.broadcast.emit('updateChatsRooms', {
        ...response,
        fullUpdate: true,
        activeModule: 'chat',
      });
    };

    socket.on('newMessage', async (msgObj: Record<string, any>) => {
      const { tokenRoom = '' } = msgObj || {};
      try {
        const model: Model<Document> | null = getModelByName('chatMsg', 'chatMsg');

        if (model && tokenRoom) {
          const displayName = (msgObj as Record<string, string>).displayName;
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
            (<any>process).send({
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

    socket.on('initFakeRoom', async (fakeData: Record<string, any>) => {
      const { fakeMsg = {}, interlocutorId = '' } = fakeData || {};

      if (!_.isEmpty(fakeMsg) && interlocutorId) {
        const result: ParserResult = await createRealRoom(fakeMsg, interlocutorId);

        if (result) {
          console.log('updateFakeRoom', result);
          callbackFakeRoom(result, fakeMsg);
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

  process.on('message', (data: any) => {
    try {
      const { action = '', payload } = data;

      switch (action) {
        case 'emitSocket': {
          const { event = '', data = {}, to = '', socket = null } = payload;

          let worker = ws.getWorker();
          if (to && to === 'broadcast' && socket) {
            socket.broadcast.emit(event, data);
            break;
          }

          if (to) {
            worker.to(to).emit(event, data);
            break;
          }

          worker.emit(event, data);
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
