import PropTypes from 'prop-types';
const { string, array, bool, oneOfType, object } = PropTypes;

export const observerTimeType = {
  title: string.isRequired,
  settingsLogs: oneOfType([array.isRequired, object.isRequired, () => null]).isRequired,
  isLoading: bool.isRequired,
};
