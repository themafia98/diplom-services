import PropTypes from 'prop-types';
import { udataType } from 'App.types';
const { object, string, oneOfType, oneOf } = PropTypes;

export const notificationPopupType = {
  notificationDep: object.isRequired,
  udata: udataType.isRequired,
  type: string.isRequired,
};

export const notificationItemType = {
  image: oneOfType([oneOf([null]), string]),
  content: string.isRequired,
  authorName: string.isRequired,
};
