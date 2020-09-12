import PropTypes from 'prop-types';

const { oneOfType, object, func, string } = PropTypes;

const fixedToolbarType = {
  onChangeVisibleAction: oneOfType([func, () => null]),
  customRender: oneOfType([object, () => null]),
  name: string,
};

export default fixedToolbarType;
