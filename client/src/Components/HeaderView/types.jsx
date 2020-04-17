import PropTypes from 'prop-types';
const { object, func, string, array, bool, oneOfType, number } = PropTypes;

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
  itemKey: oneOfType([string, number, () => null]),
  value: oneOfType([string, number, () => null]),
  sizeTab: oneOfType([string, number]),
};

export const rightPanelType = {
  hendlerTab: func.isRequired,
  active: bool.isRequired,
  itemKey: oneOfType([PropTypes.string, number, () => null]),
  value: oneOfType([PropTypes.string, number, () => null]),
  sizeTab: oneOfType([string, number]),
};
