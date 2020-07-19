import PropTypes from 'prop-types';
import { udataType } from 'types';
const { bool, object, func, string, oneOfType, number } = PropTypes;

export const commentType = {
  rules: bool.isRequired,
  it: object.isRequired,
  userId: string.isRequired,
  router: object.isRequired,
  udata: udataType.isRequired,
  uId: oneOfType([number, string]).isRequired,
  onDelete: func.isRequired,
  onEdit: func,
  removeTab: func,
  onOpenPageWithData: func,
  setCurrentTab: func,
};

export const commentsContainerType = {
  rules: bool.isRequired,
  onUpdate: func.isRequired,
  data: object.isRequired,
  udata: udataType.isRequired,
};
