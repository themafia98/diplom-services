import PropTypes from 'prop-types';
const { number, array, bool, string, func, oneOfType, oneOf, object, shape } = PropTypes;

const contentType = shape({
  entityMap: object.isRequired,
  blocks: array.isRequired,
});
const emptyShape = shape({});

export const textAreaType = {
  row: oneOfType([number.isRequired, string.isRequired]).isRequired,
  value: oneOfType([oneOf([null]), string]),
  className: string.isRequired,
  defaultValue: string.isRequired,
  name: string.isRequired,
  onKeyDown: oneOfType([oneOf([null]).isRequired, func.isRequired]),
  onClick: oneOfType([oneOf([null]).isRequired, func.isRequired]),
  onChange: oneOfType([oneOf([null]).isRequired, func.isRequired]),
  editor: bool.isRequired,
};

export const editorTextareaType = {
  disabled: bool.isRequired,
  clear: bool.isRequired,
  mode: string.isRequired,
  readOnly: bool.isRequired,
  clearStatus: func,
  onPublish: func,
  contentType: oneOfType([emptyShape.isRequired, contentType.isRequired]).isRequired,
};
