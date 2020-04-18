import PropTypes from 'prop-types';
import { udataType } from '../../types';
const { string, func, bool } = PropTypes;

export const streamBoxType = {
  mode: string.isRequired,
  type: string.isRequired,
  visiblePopover: bool.isRequired,
  isLoadPopover: bool.isRequired,
  udata: udataType.isRequired,
  setCounter: func,
  boxClassName: string,
};
