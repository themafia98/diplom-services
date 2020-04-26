import PropTypes from 'prop-types';
const { func, bool, object, objectOf } = PropTypes;

export const mainModuleType = {
  visible: bool.isRequired,
  rest: object.isRequired,
  onErrorRequestAction: func.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
  setCurrentTab: func.isRequired,
};
