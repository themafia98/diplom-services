import PropTypes from 'prop-types';
const { func, bool, object, objectOf } = PropTypes;

export const mainModuleType = {
  visible: bool.isRequired,
  rest: object.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
};
