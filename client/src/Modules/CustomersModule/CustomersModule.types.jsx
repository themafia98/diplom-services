import PropTypes from 'prop-types';
const { func, string, bool, object, arrayOf, symbol } = PropTypes;

export const customersModuleType = {
  path: string.isRequired,
  type: symbol.isRequired,
  visible: bool,
  activeTabs: arrayOf(string),
  statusApp: string,
  webSocket: object,
  visibilityPortal: bool,
  entitysList: arrayOf(string),
};

export const contactsType = {
  isBackground: bool,
  router: object.isRequired,
  onSetStatus: func.isRequired,
  path: string.isRequired,
  visible: bool,
};
