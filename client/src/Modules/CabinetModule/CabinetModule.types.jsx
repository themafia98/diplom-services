import PropTypes from 'prop-types';
import { udataType } from '../../App.types';
const { object, string, oneOfType, oneOf } = PropTypes;

export const cabinetType = {
  rest: object.isRequired,
  path: string.isRequired,
  udata: udataType.isRequired,
  routeDataActive: object.isRequired,
  modePage: oneOfType([oneOf([null]), string]),
};
