import React, { useMemo } from 'react';
import clsx from 'clsx';
import { Input } from 'antd';
import EditorTextarea from './EditorTextarea';
import { textAreaType } from './Textarea.types';
const { TextArea } = Input;

const Textarea = (props) => {
  const { row, value, className, name, onKeyDown, onClick, onChange, editor, editorKey } = props;
  const valueProps = useMemo(() => (value || value === '' ? { value } : {}), [value]);
  const propsKey = useMemo(() => (editorKey ? { key: editorKey } : {}), [editorKey]);

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
