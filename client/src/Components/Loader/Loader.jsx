import React from 'react';
import { loaderType } from './types';
import loader from './loader.gif';

const Loader = ({ className = 'defaultLoader', classNameSpiner = null }) => (
  <div className={className ? className : null}>
    <img className={classNameSpiner ? classNameSpiner : null} src={loader} alt="loader" />
  </div>
);

Loader.propTypes = loaderType;

export default Loader;
