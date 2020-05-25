import PropTypes from 'prop-types';
const { object, func, array } = PropTypes;

export const privateType = {
  component: object.isRequired,
  onLogoutAction: func.isRequired,
  routeProps: array,
};
