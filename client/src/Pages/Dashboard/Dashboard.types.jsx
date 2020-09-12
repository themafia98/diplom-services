import PropTypes from 'prop-types';
import { udataType } from 'App.types';
const { func, object, bool } = PropTypes;

export const dashboardType = {
  rest: object.isRequired,
  router: object.isRequired,
  publicReducer: object.isRequired,
  firstConnect: bool.isRequired,
  udata: udataType.isRequired,
  addTab: func.isRequired,
  removeTab: func.isRequired,
  onClearCache: func.isRequired,
  onLogoutAction: func.isRequired,
  onShowGuide: func.isRequired,
};
