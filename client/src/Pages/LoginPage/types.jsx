import PropTypes from 'prop-types';
import { udataType } from 'types';
const { object, bool } = PropTypes;

export const loginType = {
  router: object.isRequired,
  history: object.isRequired,
  location: object.isRequired,
  match: object.isRequired,
  authLoad: bool.isRequired,
  udata: udataType.isRequired,
};
