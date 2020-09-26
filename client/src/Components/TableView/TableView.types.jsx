import PropTypes from 'prop-types';
import { udataType } from '../../App.types';
const { func, string, number, object, bool, array, oneOfType, arrayOf } = PropTypes;

export const tableViewType = {
  setCurrentTab: func,
  height: oneOfType([string, number]),
  tasks: array.isRequired,
  filterBy: oneOfType([string.isRequired, arrayOf(string).isRequired]).isRequired,
  visible: bool.isRequired,
  udata: udataType.isRequired,
  path: string.isRequired,
  user: oneOfType([string, object]),
  router: object.isRequired,
  publicReducer: object.isRequired,
  onOpenPageWithData: oneOfType([func, () => null]),
  loading: bool,
  counter: oneOfType([number, string, () => null]),
  onAddRouteData: oneOfType([func, () => null]),
  statusApp: string,
};

export const dynamicTableType = {
  onOpenPageWithData: func.isRequired,
  router: object.isRequired,
  setCurrentTab: func.isRequired,
  routeParser: func.isRequired,
  routePathNormalise: func.isRequired,
  dataSource: array.isRequired,
  filterBy: oneOfType([string.isRequired, arrayOf(string).isRequired]).isRequired,
  udata: udataType.isRequired,
  height: oneOfType([string.isRequired, number.isRequired]).isRequired,
  loading: bool,
  filteredUsers: array,
  cachesAuthorList: array,
  cachesEditorList: array,
  onAddRouteData: oneOfType([func, () => null]),
};
