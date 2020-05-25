import React from 'react';
import { loaderType } from './types';
import loader from './loader.gif';

const Loader = ({ className, classNameSpiner }) => (
  <div className={className ? className : null}>
    <img className={classNameSpiner ? classNameSpiner : null} src={loader} alt="loader" />
  </div>
);

Loader.defaultProps = {
  className: 'defaultLoader',
  classNameSpiner: null,
};

Loader.propTypes = loaderType;

export default Loader;
