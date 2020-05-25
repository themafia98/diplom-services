import PropTypes from 'prop-types';
const { func, bool, object } = PropTypes;

export const drawerViewerType = {
  onClose: func.isRequired,
  visible: bool.isRequired,
  udata: object,
};
