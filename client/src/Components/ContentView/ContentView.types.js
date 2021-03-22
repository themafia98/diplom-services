import PropTypes from 'prop-types';
const { object, func, string, arrayOf, bool, oneOfType, oneOf } = PropTypes;

export const contentViewType = {
  dashboardStream: object.isRequired,
  updateLoader: func.isRequired,
  path: string.isRequired,
  statusApp: string.isRequired,
  rest: object.isRequired,
  webSocket: oneOfType([object.isRequired, () => null]),
  onChangeVisibleAction: func.isRequired,
  isToolbarActive: bool,
  visibilityPortal: bool,
  activeTabs: oneOfType([oneOf([null]), arrayOf(string)]).isRequired,
};
