import PropTypes from 'prop-types';
const { func, string, bool, object, arrayOf, objectOf } = PropTypes;

export const customersModuleType = {
  path: string.isRequired,
  visible: bool,
  activeTabs: arrayOf(string),
  rest: object.isRequired,
  onSetStatus: func.isRequired,
  router: object.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
};

export const contactsType = {
  isBackground: bool,
  router: object.isRequired,
  onSetStatus: func.isRequired,
  path: string.isRequired,
  visible: bool,
};
