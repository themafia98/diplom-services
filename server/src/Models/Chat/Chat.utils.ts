import { Socket } from 'socket.io';
import { QueryParams } from '../../Utils/Interfaces/Interfaces.global';
import { ParserResult } from '../../Utils/Types/types.global';
import ActionRunner from '../ActionRunner/ActionRunner';
import { ENTITY } from '../Database/Schema/Schema.constant';
import { PROCESS_ACTIONS, PROCESS_CHAT_EVENTS } from './Chat.constant';

export const createRealRoom = async (
  fakeMsg: Record<string, string | Record<string, any>>,
  interlocutorId: string,
): Promise<ParserResult> => {
  const actionPath: string = ENTITY.CHAT_ROOM;
  const actionType = 'create_FakeRoom';

  const actionCreateRoom = new ActionRunner({ actionPath, actionType });
  const queryParams: QueryParams = { fakeMsg, interlocutorId };
  const data: ParserResult = await actionCreateRoom.start(queryParams);

  return data;
};

export const updateFakeRoom = (socket: Socket) => (result: ParserResult, fakeMsg: Record<string, any>) => {
  const { tokenRoom = '' } = (result as Record<string, string>) || {};
  socket.join(tokenRoom);
  const response = { room: result, msg: fakeMsg };

  (process as any).send({
    action: PROCESS_ACTIONS.CHAT_PROCESS_MESSAGE_ACTION,
    payload: {
      event: PROCESS_CHAT_EVENTS.UPDATE_FAKE_ROOM_EVENT,
      to: tokenRoom,
      data: response,
    },
  });

  socket.broadcast.emit(PROCESS_CHAT_EVENTS.UPDATE_ROOMS_EVENT, {
    ...response,
    fullUpdate: true,
    activeModule: 'chat',
  });
};
