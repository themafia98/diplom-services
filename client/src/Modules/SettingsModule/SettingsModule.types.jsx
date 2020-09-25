import PropTypes from 'prop-types';
import { udataType } from 'App.types';
const { func, bool, object, string, objectOf, array } = PropTypes;

export const settingsModuleType = {
  visible: bool,
  loaderMethods: objectOf(func.isRequired).isRequired,
  rest: object.isRequired,
  path: string.isRequired,
  router: object.isRequired,
  settingsLogs: array.isRequired,
  udata: udataType.isRequired,
  shouldUpdate: bool.isRequired,
  onSaveComponentState: func.isRequired,
  onUpdateUdata: func.isRequired,
  onCaching: func.isRequired,
  onSetStatus: func.isRequired,
};