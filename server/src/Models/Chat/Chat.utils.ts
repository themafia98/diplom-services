import { Socket } from 'socket.io';
import { QueryParams } from '../../Utils/Interfaces/Interfaces.global';
import { ParserResult } from '../../Utils/Types/types.global';
import ActionApi from '../ActionRunner';
import { PROCESS_ACTIONS, PROCESS_CHAT_EVENTS } from './Chat.constant';

export const createRealRoom = async (
  fakeMsg: Record<string, string | object>,
  interlocutorId: string,
): Promise<ParserResult> => {
  const actionPath: string = 'chatRoom';
  const actionType: string = 'create_FakeRoom';

  const actionCreateRoom = new ActionApi.ActionParser({ actionPath, actionType });
  const queryParams: QueryParams = { fakeMsg, interlocutorId };
  const data: ParserResult = await actionCreateRoom.actionsRunner(queryParams);

  return data;
};

export const updateFakeRoom = (socket: Socket) => (result: ParserResult, fakeMsg: object) => {
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
