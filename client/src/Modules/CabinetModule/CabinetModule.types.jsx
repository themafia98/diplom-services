import PropTypes from 'prop-types';
import { udataType } from '../../App.types';
const { func, object, string, oneOfType, oneOf } = PropTypes;

export const cabinetType = {
  rest: object.isRequired,
  path: string.isRequired,
  udata: udataType.isRequired,
  routeData: object.isRequired,
  routeDataActive: object.isRequired,
  onUpdateUdata: func.isRequired,
  modePage: oneOfType([oneOf([null]), string]),
};
