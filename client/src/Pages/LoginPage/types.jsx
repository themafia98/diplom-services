import PropTypes from 'prop-types';
import { udataType } from '../../types';
const { func, object, bool } = PropTypes;

export const loginType = {
  addTab: func.isRequired,
  router: object.isRequired,
  history: object.isRequired,
  location: object.isRequired,
  match: object.isRequired,
  authLoad: bool.isRequired,
  udata: udataType.isRequired,
  setCurrentTab: func.isRequired,
  onLoadUdata: func.isRequired,
};
