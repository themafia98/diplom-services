import PropTypes from 'prop-types';
const { bool, string } = PropTypes;

export const tagsContainerType = {
  shouldVisibleButtonAddTag: bool,
  modeControll: string.isRequired,
  modeControllEdit: bool.isRequired,
};
