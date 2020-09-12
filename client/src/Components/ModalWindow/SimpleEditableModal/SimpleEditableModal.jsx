import React, { useState } from 'react';
import { editableModalType } from '../Modal.types';
import { Modal, Tooltip, message } from 'antd';

import Textarea from 'Components/Textarea';

const SimpleEditableModal = (props) => {
  const {
    visibility,
    title,
    onReject,
    onOkey,
    defaultValue,
    showTooltip,
    maxLength,
    Component,
    content,
  } = props;

  const [value, setValue] = useState(defaultValue);

  const onChange = ({ currentTarget: { value: val = '' } }) => {
    if (maxLength !== null) {
      if (val.length > maxLength) {
        message.warning(`Максимальная длинна: ${maxLength}`);
        return;
      }
    }

    if (val !== value) setValue(val);
  };

  const onCancel = (event) => {
    if (onReject) {
      onReject(event);
    }
  };

  const onSubmit = (event) => {
    if (onOkey) {
      onOkey(event, value);
    }
  };

  const withTooltip = (component) => {
    if (value)
      return (
        <Tooltip trigger="hover" title={value}>
          {component}
        </Tooltip>
      );
    else return component;
  };

  const textarea = <Textarea onChange={onChange} value={value} />;

  return (
    <Modal onOk={onSubmit} onCancel={onCancel} title={title} visible={visibility} destroyOnClose={true}>
      {Component ? (
        <Component {...props} />
      ) : content ? (
        content
      ) : showTooltip ? (
        withTooltip(textarea)
      ) : (
        textarea
      )}
    </Modal>
  );
};

SimpleEditableModal.defaultProps = {
  visibility: true,
  title: '',
  onReject: null,
  onOkey: null,
  defaultValue: null,
  showTooltip: false,
  maxLength: null,
  Component: null,
  content: null,
};
SimpleEditableModal.propTypes = editableModalType;

export default SimpleEditableModal;
