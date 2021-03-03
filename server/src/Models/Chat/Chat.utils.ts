import { Socket } from 'socket.io';
import { QueryParams } from '../../Utils/Interfaces/Interfaces.global';
import { ParserResult } from '../../Utils/Types/types.global';
import ActionApi from '../Action';

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
