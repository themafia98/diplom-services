import PropTypes from 'prop-types';
import { contentType, emptyShape } from '../../types';
const { number, bool, string, func, oneOfType, oneOf } = PropTypes;

export const textAreaType = {
  row: oneOfType([number.isRequired, string.isRequired]).isRequired,
  value: oneOfType([oneOf([null]), string]),
  className: string.isRequired,
  defaultValue: string.isRequired,
  name: string.isRequired,
  onKeyDown: oneOfType([oneOf([null]).isRequired, func.isRequired]),
  onClick: oneOfType([oneOf([null]).isRequired, func.isRequired]),
  onChange: oneOfType([oneOf([null]).isRequired, func.isRequired]),
  shouldDisplayButton: bool,
  contentState: contentType,
  buttonName: string,
  editorKey: string,
  editor: bool.isRequired,
};

export const editorTextareaType = {
  disabled: bool.isRequired,
  clear: bool.isRequired,
  mode: string.isRequired,
  readOnly: bool.isRequired,
  clearStatus: func,
  onPublish: func,
  onChange: func,
  shouldDisplayButton: bool,
  buttonName: string,
  contentType: oneOfType([emptyShape.isRequired, contentType.isRequired]).isRequired,
};
