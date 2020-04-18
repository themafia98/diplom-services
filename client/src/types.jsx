import PropTypes from 'prop-types';
const { array, bool, string, object, shape } = PropTypes;

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

export const contentType = shape({
  entityMap: object.isRequired,
  blocks: array.isRequired,
});

export const newsItemType = shape({
  _id: string.isRequired,
  title: string.isRequired,
  content: contentType.isRequired,
});

export const emptyShape = shape({});

export const appType = {
  addTab: PropTypes.func.isRequired,
  onSetStatus: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
  publicReducer: PropTypes.object.isRequired,
};
