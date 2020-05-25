import PropTypes from 'prop-types';
const { string, oneOfType, oneOf } = PropTypes;

export const loaderType = {
  className: string,
  classNameSpiner: oneOfType([string, oneOf([null])]),
};
