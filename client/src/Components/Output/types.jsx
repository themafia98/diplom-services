import PropTypes from 'prop-types';
const { string, object, oneOfType } = PropTypes;

export const outputType = {
  className: string,
  children: oneOfType([object, string, () => null]),
  type: PropTypes.string,
};
