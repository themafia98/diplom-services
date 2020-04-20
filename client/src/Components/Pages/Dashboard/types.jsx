import PropTypes from 'prop-types';
import { udataType } from '../../../types';
const { func, object, bool } = PropTypes;

export const dashboardType = {
  rest: object.isRequired,
  router: object.isRequired,
  publicReducer: object.isRequired,
  firstConnect: bool.isRequired,
  udata: udataType.isRequired,
  addTab: func.isRequired,
  removeTab: func.isRequired,
  onSetStatus: func.isRequired,
  onClearCache: func.isRequired,
  setCurrentTab: func.isRequired,
  onLoadCurrentData: func.isRequired,
  onErrorRequstAction: func.isRequired,
  onLogoutAction: func.isRequired,
  onShoudUpdate: func.isRequired,
  onShowGuide: func.isRequired,
};
