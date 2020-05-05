import PropTypes from 'prop-types';
const { func, bool, object, string, arrayOf, objectOf, array, number, oneOfType } = PropTypes;

export const statisticsModuleType = {
  visible: bool.isRequired,
  onErrorRequestAction: func.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
  rest: object.isRequired,
  path: string.isRequired,
  router: object.isRequired,
  onLoadCurrentData: func.isRequired,
};

export const barType = {
  subDataList: arrayOf(string.isRequired).isRequired,
  customLegendEffects: arrayOf(object.isRequired),
  data: objectOf(oneOfType([array, string, number])).isRequired,
  schemeBarProps: object,
  legendName: string,
  anchor: string,
};
