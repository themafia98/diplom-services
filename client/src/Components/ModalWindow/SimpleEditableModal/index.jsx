import React, { useState } from "react";
import { Modal } from "antd";

import Textarea from "../../Textarea";

const SimpleEditableModal = props => {

    const { visibility = true, title = "", onReject = null, onOkey = null, Component } = props;
    const [value, setValue] = useState(null);

    const onChange = ({ currentTarget: { value: val } }) => {
        if (val !== value) setValue(val);
    }

    const onCancel = event => {
        if (onReject) {
            onReject(event);
        }
    }

    const onSubmit = event => {
        if (onOkey) {
            onOkey(event, value);
        }
    }

    return (
        <Modal
            onOk={onSubmit}
            onCancel={onCancel}
            title={title}
            visible={visibility}
            destroyOnClose={true}
        >
            {Component ? (
                <Component {...props} />
            ) : (
                    <Textarea
                        onChange={onChange}
                        value={value}
                    />
                )
            }
        </Modal>
    )
};

export default SimpleEditableModal;