import PropTypes from 'prop-types';
const { string, object, oneOfType, oneOf } = PropTypes;

export const outputType = {
  className: string,
  children: oneOfType([object, string, oneOf([null])]),
  type: PropTypes.string,
};
