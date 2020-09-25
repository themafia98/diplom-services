import PropTypes from 'prop-types';
import { udataType } from '../../App.types';
const { func, object, string, oneOfType, oneOf, objectOf } = PropTypes;

export const cabinetType = {
  rest: object.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
  path: string.isRequired,
  udata: udataType.isRequired,
  routeData: object.isRequired,
  routeDataActive: object.isRequired,
  onUpdateUdata: func.isRequired,
  modePage: oneOfType([oneOf([null]), string]),
};