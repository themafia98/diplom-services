import PropTypes from 'prop-types';
const { object, func, string, arrayOf, bool } = PropTypes;

export const contentViewType = {
  dashboardStrem: object.isRequired,
  setCurrentTab: func.isRequired,
  updateLoader: func.isRequired,
  onErrorRequestAction: func.isRequired,
  path: string.isRequired,
  statusApp: string.isRequired,
  rest: func.isRequired,
  onShowLoader: func.isRequired,
  onHideLoader: func.isRequired,
  onSetStatus: func.isRequired,
  webSocket: object.isRequired,
  onChangeVisibleAction: func.isRequired,
  isToolbarActive: bool,
  visibilityPortal: bool,
  actionTabs: arrayOf(string.isRequired).isRequired,
};
