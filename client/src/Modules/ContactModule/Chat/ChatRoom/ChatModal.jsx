import React, { memo, useContext, useState, useRef } from 'react';
import _ from 'lodash';
import { Modal, Select, message, Input } from 'antd';
import ModelContext from 'Models/context';
import actionsTypes from 'actions.types';
import { requestTemplate, paramsTemplate } from 'Utils/Api/api.utils';

const { Option } = Select;

const ChatModal = memo(({ visible, usersList, onVisibleChange, uid }) => {
  const [type, setType] = useState('single');
  const [membersIds, setMembers] = useState([]);

  const context = useContext(ModelContext);
  const groupNameRef = useRef(null);

  const handleOk = async () => {
    const { Request } = context;
    const { current = {} } = groupNameRef || {};
    const { state: { value: groupName = '' } = {} } = current || {};

    try {
      const groupProps =
        type !== 'single'
          ? {
              groupName: groupName ? groupName : null,
            }
          : {};

      const rest = new Request();
      const res = await rest.sendRequest(
        '/chat/createRoom',
        'PUT',
        {
          ...requestTemplate,
          moduleName: 'chat',
          actionType: actionsTypes.$CREATE_CHAT_ROOM,
          actionPath: 'chatRoom',
          params: {
            ...paramsTemplate,
            options: {
              type,
              membersIds: _.uniq([uid, ...membersIds]),
              ...groupProps,
            },
          },
        },
        true,
      );

      if (!res || res?.status !== 200) {
        throw new Error('Bad response create chat room');
      }

      if (onVisibleChange) onVisibleChange(visible);
    } catch ({ message: msg = '', response: { status = 503 } = {} }) {
      if (onVisibleChange) onVisibleChange(visible);
      message.error(msg);
    }
  };

  const handleCancel = () => {
    if (onVisibleChange) onVisibleChange(visible);
  };

  const onChangeSelect = (eventData) => {
    setMembers(typeof eventData === 'string' ? [eventData] : eventData);
  };

  const onChangeType = (eventType) => {
    const isMore = eventType === 'single' && membersIds.length > 1;

    setType(eventType);
    setMembers(isMore ? [membersIds[0]] : [...membersIds]);
  };

  const isPrivateRoom = type === 'single' && Array.isArray(membersIds);
  const valueUser = isPrivateRoom ? membersIds[0] : membersIds;

  return (
    <Modal
      title="Создание чат комнаты."
      visible={visible}
      onOk={handleOk}
      disabled={!membersIds || (Array.isArray(membersIds) && !membersIds.length)}
      confirmLoading={false}
      onCancel={handleCancel}
    >
      <form className="chatForm" name="createChatRoom">
        <Select
          onChange={onChangeType}
          dropdownMatchSelectWidth={true}
          placeholder="выберете тип комнаты"
          defaultValue={'single'}
          defaultActiveFirstOption={true}
          value={type}
        >
          <Option value="single" label="single">
            <span>Приватный</span>
          </Option>
          <Option value="group" label="group">
            <span>Групповой</span>
          </Option>
        </Select>
        {type !== 'single' ? (
          <Input
            ref={groupNameRef}
            className="groupName__Input"
            name="groupName"
            placeholder="Название группы"
            required
          />
        ) : null}
        <Select
          onChange={onChangeSelect}
          name="users"
          mode={type !== 'single' ? 'multiple' : 'default'}
          placeholder="выберете собеседника/собеседников"
          optionLabelProp="label"
          value={valueUser}
        >
          {usersList && usersList.length
            ? usersList.map((it) => (
                <Option key={it._id} value={it._id} label={it.displayName}>
                  <span>{it.displayName}</span>
                </Option>
              ))
            : null}
        </Select>
      </form>
    </Modal>
  );
});

ChatModal.contextType = ModelContext;
ChatModal.defaultProps = {
  visible: false,
  usersList: [],
  onVisibleChange: null,
  uid: '',
};

export default ChatModal;
