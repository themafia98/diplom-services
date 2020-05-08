import PropTypes from 'prop-types';
const { bool, string, arrayOf, object } = PropTypes;

export const tagsContainerType = {
  shouldVisibleButtonAddTag: bool,
  modeControll: string.isRequired,
  modeControllEdit: bool.isRequired,
  tagList: arrayOf(object).isRequired,
};
