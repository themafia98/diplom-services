import PropTypes from 'prop-types';
const { string, oneOfType, oneOf } = PropTypes;

export const loaderType = {
  title: string,
  className: string,
  classNameSpiner: oneOfType([string, oneOf([null])]),
};
