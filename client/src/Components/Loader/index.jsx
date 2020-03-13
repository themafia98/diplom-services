import React from 'react';
import PropTypes from 'prop-types';
import loader from './loader.gif';

const Loader = ({ className = 'defaultLoader', classNameSpiner = null }) => (
  <div className={className ? className : null}>
    <img className={classNameSpiner ? classNameSpiner : null} src={loader} alt="loader" />
  </div>
);

Loader.propTypes = {
  className: PropTypes.string,
  classNameSpiner: PropTypes.oneOfType([PropTypes.string, () => null]),
};

export default Loader;
