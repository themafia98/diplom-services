import PropTypes from 'prop-types';
import { udataType, taskEntityType } from '../../../types';
const { func, string, object, bool, objectOf, number, oneOfType, oneOf } = PropTypes;

export const taskModuleType = {
  onErrorRequstAction: func.isRequired,
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
  visible: bool.isRequired,
};

export const taskViewType = {
  uuid: string.isRequired,
  rest: object.isRequired,
  isBackground: bool.isRequired,
  visible: bool.isRequired,
  height: oneOfType([string.isRequired, number.isRequired]),
  onLoadCurrentData: func.isRequired,
  onLoadCacheData: func.isRequired,
  data: taskEntityType.isRequired,
  router: object.isRequired,
  publicReducer: object.isRequired,
  udata: udataType.isRequired,
  onCaching: func.isRequired,
  onUpdate: func.isRequired,
};

export const taskModuleListType = {
  isBackground: bool.isRequired,
  rest: object.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
  visible: bool.isRequired,
  setCurrentTab: func.isRequired,
  data: object.isRequired,
  height: oneOfType([oneOf([null]), number]),
};

export const taskModuleMyListType = {
  isBackground: bool.isRequired,
  visible: bool.isRequired,
  setCurrentTab: func.isRequired,
  rest: object.isRequired,
  data: object.isRequired,
  router: object.isRequired,
  udata: udataType.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
  height: oneOfType([oneOf([null]), number]),
};

export const taskModuleCalendarType = {
  isBackground: bool.isRequired,
  visible: bool.isRequired,
  rest: object.isRequired,
  data: object.isRequired,
  router: object.isRequired,
  setCurrentTab: func.isRequired,
  onOpenPageWithData: func.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
  height: oneOfType([oneOf([null]), number]),
};
