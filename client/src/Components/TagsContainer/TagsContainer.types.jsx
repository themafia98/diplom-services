import PropTypes from 'prop-types';
const { bool, string, arrayOf, object, oneOfType, func } = PropTypes;

export const tagsContainerType = {
  shouldVisibleButtonAddTag: bool,
  modeControll: string.isRequired,
  modeControllEdit: oneOfType([bool.isRequired, object.isRequired]),
  tagList: arrayOf(object).isRequired,
  onChangeTagList: oneOfType([func, () => null]),
};
