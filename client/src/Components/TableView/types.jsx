import PropTypes from 'prop-types';
import { udataType } from '../../types';
const { func, string, number, object, bool, array, oneOfType } = PropTypes;

export const tableViewType = {
  setCurrentTab: func.isRequired,
  height: oneOfType([string, number]),
  tasks: array.isRequired,
  flag: bool.isRequired,
  visible: bool.isRequired,
  udata: udataType.isRequired,
  path: string.isRequired,
  user: oneOfType([string, object]),
  router: object.isRequired,
  publicReducer: object.isRequired,
  onLoadCurrentData: func.isRequired,
};

export const dynamicTableType = {
  onOpenPageWithData: func.isRequired,
  router: object.isRequired,
  setCurrentTab: func.isRequired,
  routeParser: func.isRequired,
  routePathNormalise: func.isRequired,
  tasks: array.isRequired,
  flag: bool.isRequired,
  udata: udataType.isRequired,
  height: oneOfType([string.isRequired, number.isRequired]).isRequired,
  loading: bool.isRequired,
};
