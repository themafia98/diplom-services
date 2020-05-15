import PropTypes from 'prop-types';

const { oneOfType, object, func } = PropTypes;

const fixedToolbarType = {
  onChangeVisibleAction: oneOfType([func, () => null]),
  customRender: oneOfType([object, () => null]),
  name: 'Action',
};

export default fixedToolbarType;
