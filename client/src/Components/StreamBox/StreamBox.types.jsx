import PropTypes from 'prop-types';
import { udataType } from '../../App.types';

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
  onSaveComponentState: func,
  streamStore: string.isRequired,
  streamModule: string.isRequired,
  onLoadPopover: func,
  personalUid: oneOfType([string, () => null]),
  setCurrentTab: func,
  onOpenPageWithData: func,
  routeData: object.isRequired,
  withStore: bool.isRequired,
  prefix: string.isRequired,
  parentPath: string,
  buildItems: oneOfType([func, () => null]),
  listHeight: oneOfType([func, () => null]),
};
