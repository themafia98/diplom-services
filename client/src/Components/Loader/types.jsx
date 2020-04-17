import PropTypes from 'prop-types';
const { string, oneOfType } = PropTypes;

export const loaderType = {
  className: string,
  classNameSpiner: oneOfType([string, () => null]),
};
