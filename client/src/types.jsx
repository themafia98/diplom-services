import PropTypes from 'prop-types';
const { shape, string, bool } = PropTypes;

export const udataType = shape({
  _id: string.isRequired,
  email: string.isRequired,
  summary: string.isRequired,
  displayName: string.isRequired,
  departament: string.isRequired,
  isOnline: bool.isRequired,
  phone: string.isRequired,
  rules: string.isRequired,
  accept: bool.isRequired,
  avatar: string.isRequired,
});
