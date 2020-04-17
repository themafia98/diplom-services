import PropTypes from 'prop-types';
const { func, string, object, array, bool, number, oneOfType } = PropTypes;

export const modalWindowType = {
  onCaching: func,
  actionType: string,
  routeDataActive: object,
  mode: string,
  path: string,
  typeRequst: string,
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
  udata: object,
};

export const editableModalType = {
  visibility: bool.isRequired,
  title: string,
  onReject: func,
  onOkey: func,
  defaultValue: oneOfType([string, () => null]),
  showTooltip: bool,
  maxLength: string,
  Component: object,
  content: oneOfType([object, string, number, () => null]),
};

export const formRegType = {
  cbOnChangeSelect: func.isRequired,
  cbOnChange: func,
};
