import PropTypes from 'prop-types';
const { func, object, objectOf } = PropTypes;

export const mainModuleType = {
  rest: object.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
};
