import PropTypes from 'prop-types';
const { func, string, oneOf, oneOfType, object, bool } = PropTypes;

export const userCardType = {
  personalData: object.isRequired,
  modePage: oneOfType([oneOf([null]), string]).isRequired,
  imageUrl: string.isRequired,
  cbShowModal: oneOfType([oneOf([null]), func]),
  isHidePhone: bool,
  isHideEmail: bool,
};
