import PropTypes from 'prop-types';
import { udataType } from 'App.types';
const { func, bool, object, string, array } = PropTypes;

export const settingsModuleType = {
  visible: bool,
  rest: object.isRequired,
  path: string.isRequired,
  settingsLogs: array.isRequired,
  udata: udataType.isRequired,
  shouldUpdate: bool.isRequired,
  onSaveComponentState: func.isRequired,
  onUpdateUdata: func.isRequired,
  onCaching: func.isRequired,
  onSetStatus: func.isRequired,
};
