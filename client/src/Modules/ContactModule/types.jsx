import PropTypes from 'prop-types';
import { udataType, contentType, emptyShape, newsItemType } from '../../types';
const { func, string, bool, object, oneOf, arrayOf, objectOf, oneOfType } = PropTypes;

export const contactModuleType = {
  onErrorRequstAction: func.isRequired,
  path: string.isRequired,
  visible: bool.isRequired,
  actionTabs: arrayOf(string.isRequired).isRequired,
  statusApp: string.isRequired,
  router: object.isRequired,
  rest: object.isRequired,
  onSetStatus: func.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
  udata: udataType.isRequired,
  onLoadCurrentData: func.isRequired,
};

export const newsType = {
  data: object.isRequired,
  isLoading: bool.isRequired,
  isBackground: bool.isRequired,
  visible: bool.isRequired,
  router: object.isRequired,
  statusApp: string.isRequired,
  onOpenPageWithData: func.isRequired,
  setCurrentTab: func.isRequired,
  onCaching: func.isRequired,
};

export const newsViewType = {
  isBackground: bool.isRequired,
  visible: bool.isRequired,
  content: oneOfType([emptyShape.isRequired, contentType.isRequired]).isRequired,
  title: string.isRequired,
  id: string.isRequired,
};

export const newsCardType = {
  onClick: oneOfType([oneOf([null]), func]).isRequired,
  className: string.isRequired,
  data: oneOfType([newsItemType.isRequired, emptyShape.isRequired]).isRequired,
};

export const createNewsType = {
  readOnly: bool.isRequired,
  udata: udataType.isRequired,
  statusApp: string.isRequired,
  isBackground: bool.isRequired,
  visible: bool.isRequired,
};
