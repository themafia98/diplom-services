import PropTypes from 'prop-types';
const { object, bool, func } = PropTypes;

export const loginType = {
  location: object,
  authLoad: bool.isRequired,
  initialSession: func.isRequired,
};
