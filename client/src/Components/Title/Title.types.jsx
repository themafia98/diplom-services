import PropTypes from 'prop-types';
const { string } = PropTypes;

export const titleType = {
  title: string.isRequired,
  className: string.isRequired,
  classNameTitle: string.isRequired,
  additional: string.isRequired,
};
