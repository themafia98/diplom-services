import PropTypes from 'prop-types';
const { string, func, bool, object } = PropTypes;

export const streamBoxType = {
  mode: string,
  boxClassName: string,
  type: string.isRequired,
  setCounter: func,
  visiblePopover: bool,
  isLoadPopover: bool,
  udata: object,
};
