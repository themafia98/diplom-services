import PropTypes from 'prop-types';
import { udataType } from '../../types';
const { bool, object, func, string } = PropTypes;

export const commentType = {
  rules: bool.isRequired,
  it: object.isRequired,
  onDelete: func.isRequired,
  userId: string.isRequired,
  uId: string.isRequired,
};

export const commentsContainerType = {
  rules: bool.isRequired,
  onUpdate: func.isRequired,
  data: object.isRequired,
  udata: udataType.isRequired,
};
