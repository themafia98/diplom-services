import PropTypes from 'prop-types';
const { string, array, bool } = PropTypes;

export const observerTimeType = {
  title: string.isRequired,
  settingsLogs: array.isRequired,
  isLoading: bool.isRequired,
};
