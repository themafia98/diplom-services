import PropTypes from 'prop-types';
import { udataType } from 'App.types';
const { bool, object, func, string, oneOfType, number, shape, array } = PropTypes;

export const commentType = {
  rules: bool.isRequired,
  it: object.isRequired,
  userId: string.isRequired,
  router: object.isRequired,
  uId: oneOfType([number, string]).isRequired,
  onDelete: func.isRequired,
  onEdit: func,
  removeTab: func,
  onOpenPageWithData: func,
  setCurrentTab: func,
};

export const commentsContainerType = {
  rules: bool,
  onUpdate: func,
  data: shape({
    comments: array,
    _id: string,
    key: string,
  }).isRequired,
};
