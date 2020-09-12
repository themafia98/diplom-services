import PropTypes from 'prop-types';
import { udataType } from 'App.types';
const { func, bool, object, symbol, any, string } = PropTypes;

export const drawerViewerType = {
  onClose: func.isRequired,
  visible: bool.isRequired,
  udata: udataType.isRequired,
  contentType: symbol.isRequired,
  moduleProps: object.isRequired,
  title: string.isRequired,
  selectedEntity: any,
};
