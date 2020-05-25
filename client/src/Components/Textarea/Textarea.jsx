// @ts-nocheck
import React from 'react';
import clsx from 'clsx';
import { Input } from 'antd';
import EditorTextarea from './EditorTextarea';
import { textAreaType } from './types';
const { TextArea } = Input;

const Textarea = (props) => {
  const { row, value, className, name, onKeyDown, onClick, onChange, editor, editorKey } = props;
  const valueProps = value || value === '' ? { value } : {};
  const propsKey = editorKey ? { key: editorKey } : {};

  return (
    <>
      {editor ? (
        <EditorTextarea {...propsKey} {...props} />
      ) : (
        <TextArea
          className={clsx(className, 'defaultTextArea')}
          row={row}
          onKeyDown={onKeyDown}
          onClick={onClick}
          onChange={onChange}
          name={name}
          {...valueProps}
        />
      )}
    </>
  );
};
Textarea.defaultProps = {
  row: 5,
  value: '',
  className: '',
  defaultValue: '',
  name: '',
  onKeyDown: null,
  onClick: null,
  onChange: null,
  editor: false,
  editorKey: '',
};

Textarea.propTypes = textAreaType;
export default Textarea;
