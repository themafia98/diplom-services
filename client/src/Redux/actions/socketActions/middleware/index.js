import moment from 'moment';
import _ from 'lodash';
import { setSocketConnection, onLoadActiveChats, setSocketError, setActiveChatToken, updateRoom } from '../';
import { errorRequestAction } from '../../publicActions';
import actionsTypes from 'actions.types';

/**
 * Middleware
 * @param {object} payload chats loading options
 * @param {object} schema - validator
 * @param {object} Request - http requests
 * @param {clientDB} clientDB - IndexedDB methods
 */

const loadActiveChats = (payload) => async (dispatch, getState, { schema, Request, clientDB }) => {
  const {
    path = '',
    actionPath = '',
    actionType = '',
    options: { socket: { socketConnection = false, module: activeModule = 'chat' } = {} } = {},
    options = {},
    shouldRefresh = false,
  } = payload || {};

  const { chat: { isFake = '' } = {} } = getState().socketReducer || {};

  try {
    if (!shouldRefresh && (!path || !actionPath) && socketConnection && activeModule) {
      dispatch(setSocketConnection({ socketConnection, activeModule }));
      return;
    }

    const restGlobal = new Request();
    const res = await restGlobal.sendRequest('/system/userList', 'GET', null, true);

    if (!res || res.status !== 200) {
      throw new Error('Fail load users list');
    }

    const {
      data: { response: { metadata: usersList = [] } = {} },
    } = res || {};

    const rest = new Request();
    /** dynamic loading chats */
    const response = await rest.sendRequest(
      `/${activeModule}/${path}`,
      'POST',
      {
        actionPath,
        actionType,
        queryParams: {
          ...options,
        },
      },
      true,
    );

    if (!response || response.status !== 200) {
      throw new Error(`Invalid load action (${actionPath}) options`);
    }

    const {
      data: { response: { metadata: listdata = [] } = {} },
    } = response || {};

    const { udata: { _id: uidState = '' } = {} } = getState().publicReducer || {};
    let activeChatRoom = null;
    if (shouldRefresh) {
      activeChatRoom = listdata.find((room) => {
        const { membersIds = [] } = room || {};
        const findResult = membersIds.every((id) => {
          if (id === isFake || id === uidState) {
            return true;
          }
          return false;
        });

        return findResult;
      });
    }

    dispatch(
      onLoadActiveChats({
        usersList: usersList.filter((user) => user._id !== uidState),
        activeChatRoom,
        shouldLoadingMessage: activeChatRoom && shouldRefresh,
        listdata,
        options,
      }),
    );
  } catch (error) {
    console.error(error);
    dispatch(
      setSocketError({
        socketConnection: shouldRefresh ? shouldRefresh : false,
        msg: error.message,
      }),
    );
    dispatch(errorRequestAction(error.message));
  }
};

const loadingDataByToken = (token, listdata, activeModule, isFake = null) => async (
  dispatch,
  getState,
  { schema, Request, clientDB },
) => {
  try {
    if (isFake) {
      dispatch(
        setActiveChatToken({
          listdata: [],
          tokenRoom: `${token}__fakeRoom`,
          isFake,
        }),
      );
      return;
    }

    const rest = new Request();

    const configToken = listdata.find((config) => config && config.tokenRoom === token) || null;

    if (!configToken) {
      throw new Error('Bad config token');
    }

    const options = Object.keys(configToken).reduce((optionsObj, key) => {
      if (key !== '_id' && key !== 'type') {
        optionsObj[key] = configToken[key];
        return optionsObj;
      }
      return optionsObj;
    }, {});

    const res = await rest.sendRequest(
      `/${activeModule}/load/tokenData`,
      'POST',
      {
        actionType: actionsTypes.$LOAD_TOKEN_DATA,
        queryParams: {
          tokenRoom: token,
          options,
        },
      },
      true,
    );

    if (!res || res.status !== 200) {
      throw new Error(`Invalid load in module ${activeModule} action tokenData`);
    }

    const {
      data: { response: { metadata: unsortlistdataMsgs = [] } = {} },
    } = res || {};

    const listdataMsgs = unsortlistdataMsgs.sort(
      (a, b) => moment(a.date, 'DD.MM.YYYY hh:mm:ss').unix() - moment(b.date, 'DD.MM.YYYY hh:mm:ss').unix(),
    );

    dispatch(
      setActiveChatToken({
        listdataMsgs,
        tokenRoom: token,
        shouldLoadingMessage: false,
      }),
    );
  } catch (error) {
    console.error(error.message);
    dispatch(errorRequestAction(error.message));
  }
};

const updateRooms = (payload) => async (dispatch, getState, { schema, Request, clientDB }) => {
  try {
    const { room: { tokenRoom: token = '', membersIds = [] } = {}, fullUpdate = false, activeModule } =
      payload || {};

    const { chat: { usersList = [], listdata: listdataState = [] } = {} } = getState().socketReducer || {};

    const { udata: { _id: uidState = '' } = {} } = getState().publicReducer || {};

    let shouldAdd = false;
    if (Array.isArray(membersIds) && membersIds.length && fullUpdate) {
      if (!membersIds.some((id) => id === uidState)) {
        shouldAdd = !membersIds.some((id) => id === uidState);
      }
    }

    if (!fullUpdate) {
      dispatch(updateRoom(payload));
    }

    const rest = new Request();
    const res = await rest.sendRequest(
      `/${activeModule}/load/tokenData`,
      'POST',
      {
        queryParams: {
          queryParams: { tokenRoom: token, moduleName: activeModule },
        },
        options: {
          actionPath: 'chatRoom',
          actionType: actionsTypes.$GET_UPDATE_ROOMS,
        },
      },
      true,
    );

    const {
      data: { response: { metadata = [] } = {} },
    } = res || {};

    if (!res || res.status !== 200) {
      throw new Error(`Invalid load in module ${activeModule} action tokenData`);
    }

    const rooms =
      shouldAdd && _.isArray(metadata) && metadata[0] ? [...listdataState, metadata[0]] : [...listdataState];

    const normalizeRooms = _.uniqWith(rooms, (a, b) => a._id !== b._id);

    dispatch(
      onLoadActiveChats({
        usersList: usersList.filter((user) => user._id !== uidState),
        listdata: normalizeRooms,
        options: {
          socket: {
            socketConnection: true,
            module: activeModule,
          },
        },
      }),
    );
  } catch (error) {
    console.error(error.message);
    dispatch(errorRequestAction(error.message));
  }
};

export { loadActiveChats, loadingDataByToken, updateRooms };
