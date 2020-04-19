import PropTypes from 'prop-types';
import { udataType } from '../../types';
const { func, string, oneOf, oneOfType, object } = PropTypes;

export const userCardType = {
  personalData: object.isRequired,
  modePage: oneOfType([oneOf([null]), string]).isRequired,
  imageUrl: string.isRequired,
  onUpdateUdata: oneOfType([oneOf([null]), func]),
  cbShowModal: oneOfType([oneOf([null]), func]),
  udata: udataType.isRequired,
};
