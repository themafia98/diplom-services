import PropTypes from 'prop-types';
import { udataType, taskEntityType } from '../../App.types';
const { func, string, object, bool, objectOf, number, oneOfType, oneOf } = PropTypes;

export const taskModuleType = {
  onOpenPageWithData: func.isRequired,
  onLoadCurrentData: func.isRequired,
  setCurrentTab: func.isRequired,
  onLoadCacheData: func.isRequired,
  removeTab: func.isRequired,
  addTab: func.isRequired,
  path: string.isRequired,
  publicReducer: object.isRequired,
  router: object.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
  udata: udataType,
  rest: object.isRequired,
};

export const taskViewType = {
  uuid: string.isRequired,
  rest: object.isRequired,
  isBackground: bool.isRequired,
  height: oneOfType([string.isRequired, number.isRequired]),
  onLoadCurrentData: func.isRequired,
  onLoadCacheData: func.isRequired,
  data: taskEntityType,
  router: object.isRequired,
  publicReducer: object.isRequired,
  modeControllEdit: oneOfType([bool.isRequired, object.isRequired, () => null]),
  udata: udataType.isRequired,
  onCaching: func.isRequired,
  onUpdate: func.isRequired,
};

export const taskModuleListType = {
  rest: object.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
  setCurrentTab: func.isRequired,
  data: object.isRequired,
  height: oneOfType([oneOf([null]), number, string]),
};

export const taskModuleMyListType = {
  setCurrentTab: func.isRequired,
  rest: object.isRequired,
  data: object.isRequired,
  router: object.isRequired,
  udata: udataType.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
  height: oneOfType([oneOf([null]), number, string]),
};

export const taskModuleCalendarType = {
  rest: object.isRequired,
  data: object.isRequired,
  router: object.isRequired,
  setCurrentTab: func.isRequired,
  onOpenPageWithData: func.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
  height: oneOfType([oneOf([null]), number, string]),
};

export const createTaskType = {
  onLoadCurrentData: func.isRequired,
  statusApp: string.isRequired,
  onOpenPageWithData: func,
  removeTab: func,
  rest: object,
  router: object.isRequired,
  statusList: object.isRequired,
  udata: udataType,
  visibleMode: string,
  contentDrawer: oneOfType([string, number, object]),
  dateFormat: string,
};