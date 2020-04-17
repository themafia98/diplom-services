import PropTypes from 'prop-types';
const { func, string, number, object, bool, array, oneOfType } = PropTypes;

export const tableViewType = {
  setCurrentTab: func.isRequired,
  height: oneOfType([string, number]),
  tasks: array,
  path: string,
  data: object,
  flag: bool,
  user: oneOfType([string, object]),
  router: object.isRequired,
  publicReducer: object.isRequired,
};
