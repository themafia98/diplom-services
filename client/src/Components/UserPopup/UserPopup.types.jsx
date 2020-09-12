import PropTypes from 'prop-types';

const { func, object, oneOfType } = PropTypes;

const userPopupType = {
  goCabinet: oneOfType([func, () => null]),
  udata: object,
};

export default userPopupType;
