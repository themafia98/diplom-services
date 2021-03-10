import PropTypes from 'prop-types';
import { udataType } from '../../App.types';
const { func, string, number, object, bool, array, oneOfType, arrayOf, oneOf } = PropTypes;

export const tableViewType = {
  filterBy: oneOfType([string, arrayOf(string)]).isRequired,
  visible: bool.isRequired,
  path: string.isRequired,
  height: oneOfType([string, number]),
  user: oneOfType([string, object]),
  counter: oneOfType([number, string, oneOf([null])]),
  loading: bool,
  statusApp: string,
  tableViewHeight: number,
};

export const tableType = {
  onOpenPageWithData: func.isRequired,
  router: object.isRequired,
  setCurrentTab: func.isRequired,
  routeParser: func.isRequired,
  routePathNormalise: func.isRequired,
  dataSource: array.isRequired,
  filterBy: oneOfType([string, arrayOf(string)]),
  udata: udataType.isRequired,
  height: oneOfType([string.isRequired, number.isRequired]).isRequired,
  loading: bool,
  filteredUsers: array,
  cachesAuthorList: array,
  cachesEditorList: array,
  onAddRouteData: oneOfType([func, oneOf([null])]),
};
