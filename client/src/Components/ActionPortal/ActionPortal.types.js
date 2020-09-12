import PropTypes from 'prop-types';

const { object, oneOfType } = PropTypes;

const actionPortalType = {
  action: oneOfType([object, () => null]),
  children: oneOfType([object, () => null]),
};

export default actionPortalType;
