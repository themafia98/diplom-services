import PropTypes from 'prop-types';
const { string, object, oneOfType, number, arrayOf } = PropTypes;

export const outputType = {
  className: string,
  children: oneOfType([object, string, number, arrayOf(string), () => null]),
  type: PropTypes.string,
  action: string,
  typeOutput: string,
};
