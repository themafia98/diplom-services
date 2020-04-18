import PropTypes from 'prop-types';
const { object } = PropTypes;

export const recovoryType = {
  history: object.isRequired,
  location: object.isRequired,
  match: object.isRequired,
};
