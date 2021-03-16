import PropTypes from 'prop-types';
const { object, string, oneOfType, oneOf } = PropTypes;

export const cabinetType = {
  rest: object.isRequired,
  path: string.isRequired,
  modePage: oneOfType([oneOf([null]), string]),
};
