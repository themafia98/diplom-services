import React from "react";
import _ from "lodash";
import { Modal, Select, message, Input } from "antd";

const { Option } = Select;

class ChatModal extends React.PureComponent {
    state = {
        confirmLoading: false,
        type: "single",
        membersIds: []
    };

    handleOk = async () => {
        const { visible, onVisibleChange, Request = null, uid = "" } = this.props;
        const { type = "", membersIds = [] } = this.state;
        try {
            if (!Request) {
                throw new Error("Bad request object (chat)");
            }

            const groupProps =
                type !== "single"
                    ? {
                          groupName: this.groupNameRef ? this.groupNameRef.state.value : null
                      }
                    : {};

            const rest = new Request();
            const res = await rest.sendRequest("/chat/createRoom", "PUT", {
                actionPath: "chatRoom",
                actionType: "create_chatRoom",
                queryParams: {
                    type,
                    moduleName: "chat",
                    membersIds: _.uniq([uid, ...membersIds]),
                    ...groupProps
                }
            });

            if (!res || res.status !== 200) {
                throw new Error("Bad response create chat room");
            }

            // if (membersIds.length <= 1 && type === "single") {
            //     throw new Error("Bad members counter");
            // }

            onVisibleChange(visible, res.status === 200);
        } catch (error) {
            console.error(error.message);
            onVisibleChange(visible);
            message.error(error.message);
        }
    };

    handleCancel = () => {
        const { visible, onVisibleChange } = this.props;
        onVisibleChange(visible);
    };

    onChangeSelect = eventData => {
        this.setState({
            ...this.state,
            membersIds: _.isString(eventData) ? [eventData] : eventData
        });
    };

    onChangeType = eventType => {
        const { membersIds = [] } = this.state;
        const isMore = eventType === "single" && membersIds.length > 1;

        this.setState({
            type: eventType,
            membersIds: isMore ? [membersIds[0]] : [...membersIds]
        });
    };

    groupNameRef = null;
    groupNameRefFunc = node => (this.groupNameRef = node);

    render() {
        const { confirmLoading, type = "single", membersIds = [] } = this.state;
        const { visible, usersList = [] } = this.props;

        const valueUser = type === "single" && Array.isArray(membersIds) ? membersIds[0] : membersIds;

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
                        defaultValue={"single"}
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
                    {type !== "single" ? (
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
                        mode={type !== "single" ? "multiple" : "default"}
                        placeholder="выберете собеседника/собеседников"
                        optionLabelProp="label"
                        value={valueUser}
                    >
                        {usersList && usersList.length
                            ? usersList.map(it => (
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
