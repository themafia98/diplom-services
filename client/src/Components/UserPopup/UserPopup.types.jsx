import PropTypes from 'prop-types';

const { func, oneOfType } = PropTypes;

const userPopupType = {
  goCabinet: oneOfType([func, () => null]),
};

export default userPopupType;
