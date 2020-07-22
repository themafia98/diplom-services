import PropTypes from 'prop-types';
const { object, string, bool, oneOfType, array, func } = PropTypes;

export const tabContainerType = {
  actualParams: object.isRequired,
  children: oneOfType([object.isRequired, array.isRequired]).isRequired,
  classNameTab: string.isRequired,
  onChangeVisibleAction: oneOfType([func, () => null]),
  isPortal: bool,
  isTab: bool,
};
