import React, { useState } from "react";
import { Modal, Tooltip } from "antd";

import Textarea from "../../Textarea";

const SimpleEditableModal = props => {

    const {
        visibility = true,
        title = "",
        onReject = null,
        onOkey = null,
        defaultValue = null,
        showTooltip = false,
        Component
    } = props;

    const [value, setValue] = useState(defaultValue);

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

    const withTooltip = component => {
        if (value)
            return (
                <Tooltip trigger="hover" title={value}>
                    {component}
                </Tooltip>
            )
        else return component;
    };

    const textarea = (
        <Textarea
            onChange={onChange}
            value={value}
        />
    );

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
            ) : showTooltip ? withTooltip(textarea) : textarea
            }
        </Modal>
    )
};

export default SimpleEditableModal;