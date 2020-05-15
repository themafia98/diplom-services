import PropTypes from 'prop-types';
import { udataType } from '../../types';

const { string, func, bool, oneOfType, object } = PropTypes;

export const streamBoxType = {
  mode: string.isRequired,
  type: string.isRequired,
  visiblePopover: bool.isRequired,
  isLoadPopover: bool.isRequired,
  udata: udataType.isRequired,
  setCounter: func,
  boxClassName: string,
  isSingleLoading: bool,
  filterStream: string.isRequired,
  onMultipleLoadData: func,
  onSaveComponentState: func,
  streamStore: string.isRequired,
  streamModule: string.isRequired,
  onLoadPopover: func,
  personalUid: oneOfType([string, () => null]),
  setCurrentTab: func,
  onOpenPageWithData: func,
  router: object.isReuqred,
  store: string.isRequired,
  prefix: string.isRequired,
};
