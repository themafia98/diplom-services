import PropTypes from 'prop-types';
const { func, bool, object, string, arrayOf, objectOf } = PropTypes;

export const statisticsModuleType = {
  visible: bool.isRequired,
  onErrorRequstAction: func.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
  rest: object.isRequired,
  path: string.isRequired,
  router: object.isRequired,
  onLoadCurrentData: func.isRequired,
};

export const barType = {
  isPartData: bool.isRequired,
  data: arrayOf(object.isRequired).isRequired,
  dateList: arrayOf(string.isRequired).isRequired,
};
