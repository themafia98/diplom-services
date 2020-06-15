import PropTypes from 'prop-types';
import { udataType } from '../../types';
const { func, object, bool, string, oneOfType, oneOf, objectOf } = PropTypes;

export const cabinetType = {
  visible: bool.isRequired,
  rest: object.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
  path: string.isRequired,
  udata: udataType.isRequired,
  routeData: object.isRequired,
  routeDataActive: object.isRequired,
  onSaveComponentState: func.isRequired,
  onUpdateUdata: func.isRequired,
  modePage: oneOfType([oneOf([null]), string]).isRequired,
};
