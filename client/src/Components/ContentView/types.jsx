import PropTypes from 'prop-types';
const { object, func, string, arrayOf } = PropTypes;

export const contentViewType = {
  dashboardStrem: object.isRequired,
  setCurrentTab: func.isRequired,
  updateLoader: func.isRequired,
  onErrorRequestAction: func.isRequired,
  path: string.isRequired,
  actionTabs: arrayOf(string.isRequired).isRequired,
};
