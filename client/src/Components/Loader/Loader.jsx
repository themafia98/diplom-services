import React from 'react';
import { loaderType } from './types';
import loader from './loader.gif';
import clsx from 'clsx';

const Loader = ({ className, classNameSpiner, title }) => (
  <div className={clsx(className, title && 'withTitle')}>
    <img className={classNameSpiner} src={loader} alt="loader" />
    {title ? <p className="title_loader">{title}</p> : null}
  </div>
);

Loader.defaultProps = {
  title: '',
  className: 'defaultLoader',
  classNameSpiner: null,
};

Loader.propTypes = loaderType;

export default Loader;
