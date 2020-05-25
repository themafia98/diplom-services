// @ts-nocheck
import React from 'react';
import _ from 'lodash';
import { Modal, Select, message, Input } from 'antd';
import modelContext from 'Models/context';

const { Option } = Select;

class ChatModal extends React.PureComponent {
  state = {
    confirmLoading: false,
    type: 'single',
    membersIds: [],
  };
  static contextType = modelContext;
  static defaultProps = {
    visible: false,
    usersList: [],
    onVisibleChange: null,
    uid: '',
  };

  handleOk = async () => {
    const { Request = null } = this.context;
    const { visible, onVisibleChange, uid } = this.props;
    const { type = '', membersIds = [] } = this.state;
    try {
      const groupProps =
        type !== 'single'
          ? {
              groupName: this.groupNameRef ? this.groupNameRef.state.value : null,
            }
          : {};

      const rest = new Request();
      const res = await rest.sendRequest('/chat/createRoom', 'PUT', {
        actionPath: 'chatRoom',
        actionType: 'create_chatRoom',
        queryParams: {
          type,
          moduleName: 'chat',
          membersIds: _.uniq([uid, ...membersIds]),
          ...groupProps,
        },
      });

      if (!res || res.status !== 200) {
        throw new Error('Bad response create chat room');
      }

      if (onVisibleChange) onVisibleChange(visible, res.status === 200);
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error.message);
      if (onVisibleChange) onVisibleChange(visible);
      message.error(error.message);
    }
  };

  handleCancel = () => {
    const { visible, onVisibleChange } = this.props;
    if (onVisibleChange) onVisibleChange(visible);
  };

  /**
   * @param {any} eventData
   */
  onChangeSelect = (eventData) => {
    this.setState({
      ...this.state,
      membersIds: _.isString(eventData) ? [eventData] : eventData,
    });
  };

  /**
   * @param {string} eventType
   */
  onChangeType = (eventType) => {
    const { membersIds = [] } = this.state;
    const isMore = eventType === 'single' && membersIds.length > 1;

    this.setState({
      type: eventType,
      membersIds: isMore ? [membersIds[0]] : [...membersIds],
    });
  };

  groupNameRef = null;
  /**
   * @param {HTMLElement} node
   */
  groupNameRefFunc = (node) => (this.groupNameRef = node);

  render() {
    const { confirmLoading, type = 'single', membersIds = [] } = this.state;
    const { visible, usersList } = this.props;

    const valueUser = type === 'single' && Array.isArray(membersIds) ? membersIds[0] : membersIds;

    return (
      <Modal
        title="Создание чат комнаты."
        visible={visible}
        onOk={this.handleOk}
        disabled={!membersIds || (Array.isArray(membersIds) && !membersIds.length)}
        confirmLoading={confirmLoading}
        onCancel={this.handleCancel}
      >
        <form className="chatForm" name="createChatRoom">
          <Select
            onChange={this.onChangeType}
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
              ref={this.groupNameRefFunc}
              className="groupName__Input"
              name="groupName"
              placeholder="Название группы"
              required
            />
          ) : null}
          <Select
            onChange={this.onChangeSelect}
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
  }
}

export default ChatModal;
