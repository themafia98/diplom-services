import PropTypes from 'prop-types';
const { func, bool } = PropTypes;

export const drawerViewerType = {
  onClose: func.isRequired,
  visible: bool.isRequired,
};
