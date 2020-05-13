import PropTypes from 'prop-types';
import { udataType } from '../../types';
const { func, string, object, array, bool, number, oneOfType, oneOf } = PropTypes;

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
};

export const editableModalType = {
  visibility: bool.isRequired,
  title: string,
  onReject: func,
  onOkey: func,
  showTooltip: bool,
  Component: object,
  maxLength: oneOfType([string, number]),
  defaultValue: oneOfType([string, oneOf([null])]),
  content: oneOfType([object, string, number, oneOf([null])]),
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
