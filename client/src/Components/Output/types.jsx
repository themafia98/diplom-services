import PropTypes from 'prop-types';
const { string, object, oneOfType, number, arrayOf, bool, array } = PropTypes;

export const outputType = {
  className: string,
  children: oneOfType([object, string, number, arrayOf(string), () => null]),
  type: PropTypes.string,
  action: string,
  typeOutput: string,
  id: string,
  isLoad: bool,
  links: oneOfType([array, () => null]),
  list: bool,
  isLink: bool,
  isStaticList: false,
  outputClassName: '',
};
