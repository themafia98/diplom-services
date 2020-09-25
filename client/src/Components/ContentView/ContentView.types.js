import PropTypes from 'prop-types';
const { object, func, string, arrayOf, bool, oneOfType } = PropTypes;

export const contentViewType = {
  dashboardStrem: object.isRequired,
  updateLoader: func.isRequired,
  path: string.isRequired,
  statusApp: string.isRequired,
  rest: object.isRequired,
  onShowLoader: func.isRequired,
  onHideLoader: func.isRequired,
  webSocket: oneOfType([object.isRequired, () => null]),
  onChangeVisibleAction: func.isRequired,
  isToolbarActive: bool,
  visibilityPortal: bool,
  activeTabs: arrayOf(string.isRequired).isRequired,
};