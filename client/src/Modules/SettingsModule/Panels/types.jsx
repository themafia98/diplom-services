import PropTypes from 'prop-types';

const { string, func, bool } = PropTypes;

const panelCommonType = {
  onSaveSettings: func.isRequired,
  emailValue: string.isRequired,
  telValue: string.isRequired,
};

const panelPasswordType = {
  onSaveSettings: func.isRequired,
  oldPassword: string.isRequired,
  newPassword: string.isRequired,
};

const panelProfileType = {
  onSaveSettings: func.isRequired,
  isHidePhone: bool.isRequired,
  isHideEmail: bool.isRequired,
};

export { panelCommonType, panelPasswordType, panelProfileType };
