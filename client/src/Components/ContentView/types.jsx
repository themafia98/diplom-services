import PropTypes from 'prop-types';
const { object, func, string, arrayOf, bool, oneOfType } = PropTypes;

export const contentViewType = {
  dashboardStrem: object.isRequired,
  setCurrentTab: func.isRequired,
  updateLoader: func.isRequired,
  onErrorRequestAction: func.isRequired,
  path: string.isRequired,
  statusApp: string.isRequired,
  rest: object.isRequired,
  onShowLoader: func.isRequired,
  onHideLoader: func.isRequired,
  onSetStatus: func.isRequired,
  webSocket: oneOfType([object.isRequired, () => null]),
  onChangeVisibleAction: func.isRequired,
  isToolbarActive: bool,
  visibilityPortal: bool,
  activeTabs: arrayOf(string.isRequired).isRequired,
};
