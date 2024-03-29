import PropTypes from 'prop-types';
const { object, func, string, arrayOf, oneOf, bool, oneOfType, number } = PropTypes;

export const headerViewType = {
  dashboardStream: object.isRequired,
  cbMenuTabHandler: func.isRequired,
  activeTabEUID: string.isRequired,
  logout: PropTypes.func.isRequired,
  tabs: oneOfType([oneOf([null]), arrayOf(string)]),
  goCabinet: func,
  webSocket: object,
};

export const tabType = {
  hendlerTab: func.isRequired,
  active: bool.isRequired,
  itemKey: oneOfType([string, number, () => null]),
  value: oneOfType([string, number, () => null]),
  sizeTab: oneOfType([string, number]),
  index: number.isRequired,
};

export const rightPanelType = {
  active: bool.isRequired,
  itemKey: oneOfType([string, number, () => null]),
  value: oneOfType([string, number, () => null]),
  sizeTab: oneOfType([string, number]),
  status: string.isRequired,
  notificationDep: object.isRequired,
  onUpdate: oneOfType([func, () => null]),
  onLogout: oneOfType([func, () => null]),
  goCabinet: oneOfType([func, () => null]),
  shouldUpdate: bool,
  webSocket: object,
};

export const statusType = {
  statusApp: string.isRequired,
  shouldUpdate: bool.isRequired,
};
