import PropTypes from 'prop-types';
const { string, oneOfType, oneOf, func } = PropTypes;
export const updaterType = {
  className: string,
  additionalClassName: string,
  onClick: oneOfType([func.isRequired, oneOf([null])]),
};
