import PropTypes from 'prop-types';
import { udataType, taskEntityType } from '../../App.types';
const { func, string, object, bool, number, oneOfType, oneOf } = PropTypes;

export const taskModuleType = {
  onOpenPageWithData: func.isRequired,
  onLoadCurrentData: func.isRequired,
  setCurrentTab: func.isRequired,
  onLoadCacheData: func.isRequired,
  removeTab: func.isRequired,
  addTab: func.isRequired,
  path: string.isRequired,
  router: object.isRequired,
  udata: udataType,
  rest: object.isRequired,
};

export const taskViewType = {
  uuid: string.isRequired,
  data: taskEntityType.isRequired,
  modeControllEdit: oneOfType([bool, object, oneOf([null])]).isRequired,
};

export const taskModuleListType = {
  rest: object.isRequired,
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
  height: oneOfType([oneOf([null]), number, string]),
};

export const taskModuleCalendarType = {
  rest: object.isRequired,
  data: object.isRequired,
  router: object.isRequired,
  setCurrentTab: func.isRequired,
  onOpenPageWithData: func.isRequired,
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
