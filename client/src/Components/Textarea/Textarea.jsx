import React from 'react';
import clsx from 'clsx';
import { Input } from 'antd';
import EditorTextarea from './EditorTextarea';
import { textAreaType } from './types';
const { TextArea } = Input;

const Textarea = props => {
  const { row, value, className, defaultValue, name, onKeyDown, onClick, onChange, editor } = props;
  const valueProps = value || value === '' ? { value } : {};

  return (
    <React.Fragment>
      {editor ? (
        <EditorTextarea defaultValue={defaultValue} onChange={onChange} {...valueProps} />
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
    </React.Fragment>
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
};

Textarea.propTypes = textAreaType;
export default Textarea;
