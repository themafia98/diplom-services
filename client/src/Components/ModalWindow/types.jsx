import PropTypes from 'prop-types';
import { udataType } from 'types';
const { func, string, object, array, bool, number, oneOfType } = PropTypes;

export const modalWindowType = {
  onCaching: func,
  actionType: string,
  routeDataActive: object,
  mode: string,
  path: string,
  keyTask: string,
  accessStatus: array,
  onUpdate: PropTypes.func,
  onEdit: func,
  onRejectEdit: func,
  modeControll: string,
  editableContent: string,
  modeEditContent: bool,
  onCancelEditModeContent: func,
  onUpdateEditable: func,
  statusTaskValue: string,
  udata: udataType,
  defaultView: bool,
  rulesEdit: bool,
  rulesStatus: bool,
  isLoadList: bool,
  actionTypeList: string,
};

export const editableModalType = {
  visibility: bool.isRequired,
  title: string,
  onReject: func,
  onOkey: func,
  showTooltip: bool,
  Component: object,
  maxLength: oneOfType([string, number]),
  defaultValue: oneOfType([string, () => null]),
  content: oneOfType([object, string, number, () => null]),
};

export const formRegType = {
  cbOnChangeSelect: func.isRequired,
  cbOnChange: func,
};

export const trackerModalType = {
  odeSetTime: func,
  onChangeTask: func,
  error: object,
  timeLost: string,
  description: string,
  descriptionDefault: string,
};

export const mailResponserType = {
  routeDataActive: object.isRequired,
  visibleModal: bool,
  handleCancel: oneOfType([func, () => null]),
  handleOk: oneOfType([func, () => null]),
};
