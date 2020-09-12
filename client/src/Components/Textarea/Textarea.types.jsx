import PropTypes from 'prop-types';
import { contentState, emptyShape } from 'App.types';
const { number, bool, string, func, oneOfType } = PropTypes;

export const textAreaType = {
  row: oneOfType([number.isRequired, string.isRequired]).isRequired,
  value: oneOfType([() => null, string]),
  className: string.isRequired,
  name: string.isRequired,
  onKeyDown: oneOfType([() => null, func.isRequired]),
  onClick: oneOfType([() => null, func.isRequired]),
  onChange: oneOfType([() => null, func.isRequired]),
  shouldDisplayButton: bool,
  contentState: contentState,
  buttonName: string,
  editorKey: string,
  editor: bool.isRequired,
};

export const editorTextareaType = {
  disabled: oneOfType([bool, string]).isRequired,
  clear: bool.isRequired,
  mode: string.isRequired,
  readOnly: bool.isRequired,
  clearStatus: func,
  onPublish: func,
  onChange: func,
  shouldDisplayButton: bool,
  buttonName: string,
  contentState: oneOfType([emptyShape.isRequired, contentState.isRequired]).isRequired,
};
