import PropTypes from 'prop-types';
const { bool, object, string, arrayOf, objectOf, array, number, oneOfType } = PropTypes;

export const statisticsModuleType = {
  visible: bool,
  rest: object.isRequired,
  path: string.isRequired,
};

export const barType = {
  subDataList: arrayOf(string.isRequired).isRequired,
  customLegendEffects: arrayOf(object.isRequired),
  data: objectOf(oneOfType([array, string, number])).isRequired,
  schemeBarProps: object,
  legendName: string,
  anchor: string,
};
