import PropTypes from 'prop-types';
const { object, string, oneOfType } = PropTypes;

export const notificationPopupType = {
  notificationDep: object.isRequired,
  udata: object.isRequired,
  type: string.isRequired,
};

export const notificationItemType = {
  image: oneOfType([() => null, string]),
  content: string.isRequired,
  authorName: string.isRequired,
};
