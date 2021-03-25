import Request from 'Models/Rest';
import { paramsTemplate, requestTemplate } from 'Utils/Api/api.utils';

export const fetchDepUsersList = async (editor) => {
  try {
    const rest = new Request();
    const res = await rest.sendRequest('/system/userList', 'GET', null, true);

    if (res.status !== 200) {
      throw new Error('fail load user list');
    }

    const { response = {} } = res.data;
    const { metadata = [] } = response;

    const filteredUsers = metadata.reduce((usersList, user) => {
      const { _id = '', displayName = '' } = user;

      if (!user || !_id || !displayName) return usersList;

      return [
        ...usersList,
        {
          _id,
          displayName,
        },
      ];
    }, []);

    const dataEditor = Array.isArray(editor)
      ? filteredUsers.filter(
          ({ _id: userId }) => Array.isArray(editor) && editor.some((value) => value === userId),
        )
      : filteredUsers;

    return [dataEditor, filteredUsers];
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchTasksPriorityList = async () => {
  try {
    const rest = new Request();

    const res = await rest.sendRequest(
      '/settings/tasksPriorityList',
      'GET',
      {
        ...requestTemplate,
        moduleName: 'settingsModule',
        actionType: 'get_tasksPriority',
        params: {
          ...paramsTemplate,
        },
      },
      true,
    );

    if (!res || res.status !== 200) {
      throw new Error('Bad request tasksPriority');
    }

    const { response = {} } = res.data;
    const { metadata = null } = response;

    return metadata;
  } catch (error) {
    console.error(error);
    return null;
  }
};
