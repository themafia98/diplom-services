import PropTypes from 'prop-types';
const { object, func, string, array, bool, oneOfType, number, oneOf } = PropTypes;

export const headerViewType = {
  dashboardStrem: object.isRequired,
  cbMenuTabHandler: func.isRequired,
  activeTabEUID: string.isRequired,
  actionTabs: oneOfType([array, bool]).isRequired,
  logout: PropTypes.func.isRequired,
};

export const tabType = {
  hendlerTab: func.isRequired,
  active: bool.isRequired,
  itemKey: oneOfType([string, number, oneOf([null])]),
  value: oneOfType([string, number, oneOf([null])]),
  sizeTab: oneOfType([string, number]),
};

export const rightPanelType = {
  active: bool.isRequired,
  itemKey: oneOfType([PropTypes.string, number, oneOf([null])]),
  value: oneOfType([PropTypes.string, number, oneOf([null])]),
  sizeTab: oneOfType([string, number]),
  status: string.isRequired,
  notificationDep: object.isRequired,
};

export const statusType = {
  statusApp: string.isRequired,
  shouldUpdate: bool.isRequired,
};
