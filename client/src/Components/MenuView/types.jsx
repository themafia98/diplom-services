import PropTypes from 'prop-types';
const { bool, func, oneOfType, object, string, oneOf } = PropTypes;

export const menuViewType = {
  collapsed: bool.isRequired,
  cbOnCollapse: func.isRequired,
  items: oneOfType([PropTypes.arrayOf(object.isRequired).isRequired, oneOf([null])]),
  cbMenuHandler: func.isRequired,
  activeTabEUID: string.isRequired,
  cbGoMain: func.isRequired,
};
