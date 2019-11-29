import React from "react";
import { Modal } from "antd";

class ChatModal extends React.PureComponent {
    state = {
        confirmLoading: false
    };

    handleOk = () => {
        const { visible, onVisibleChange } = this.props;
        onVisibleChange(visible);
    };

    handleCancel = () => {
        const { visible, onVisibleChange } = this.props;
        onVisibleChange(visible);
    };

    render() {
        const { confirmLoading } = this.state;
        const { visible } = this.props;
        return (
            <Modal
                title="Создание чат комнаты."
                visible={visible}
                onOk={this.handleOk}
                confirmLoading={confirmLoading}
                onCancel={this.handleCancel}
            ></Modal>
        );
    }
}

export default ChatModal;
