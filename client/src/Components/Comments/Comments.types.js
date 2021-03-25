import PropTypes from 'prop-types';
const { bool, object, func, string, oneOfType, number, shape, array } = PropTypes;

export const commentType = {
  rules: bool.isRequired,
  it: object.isRequired,
  userId: string.isRequired,
  uId: oneOfType([number, string]).isRequired,
  onDelete: func.isRequired,
  onEdit: func,
};

export const commentsContainerType = {
  rules: bool,
  data: shape({
    comments: array,
    _id: string,
    key: string,
  }).isRequired,
};
