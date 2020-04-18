import PropTypes from 'prop-types';
const { object, string, bool, oneOfType, array } = PropTypes;

export const tabContainerType = {
  children: oneOfType([object.isRequired, array.isRequired]).isRequired,
  isBackground: bool.isRequired,
  visible: bool.isRequired,
  className: string.isRequired,
};
