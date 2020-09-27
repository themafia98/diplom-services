import PropTypes from 'prop-types';
const { array, bool, string, object, shape, arrayOf } = PropTypes;

export const udataType = shape({
  _id: string,
  email: string,
  summary: string,
  displayName: string,
  departament: string,
  isOnline: bool,
  phone: string,
  rules: string,
  accept: bool,
  avatar: string,
});

export const contentState = shape({
  entityMap: object.isRequired,
  blocks: array.isRequired,
});

export const taskEntityType = shape({
  _id: string.isRequired,
  editor: arrayOf(string.isRequired).isRequired,
  date: arrayOf(string.isRequired).isRequired,
  comments: arrayOf(object.isRequired).isRequired,
  key: string.isRequired,
  status: string.isRequired,
  name: string.isRequired,
  priority: string.isRequired,
  authorName: string.isRequired,
  uidCreater: string.isRequired,
  description: string.isRequired,
});

export const newsItemType = shape({
  _id: string.isRequired,
  title: string.isRequired,
  content: contentState.isRequired,
});

export const emptyShape = shape({});

export const appType = {
  addTab: PropTypes.func.isRequired,
  onSetStatus: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
};
