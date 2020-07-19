import React from 'react';
import { titleType } from './types';
import clsx from 'clsx';

const TitleModule = ({ title, className, classNameTitle, additional }) => (
  <div className={clsx('titleModule', className)}>
    <p className={clsx('titleModule_title', classNameTitle)}>{title}</p>
    {additional ? <span>{additional}</span> : null}
  </div>
);

TitleModule.defaultProps = {
  title: '',
  className: '',
  classNameTitle: '',
  additional: '',
};
TitleModule.propTypes = titleType;
export default TitleModule;
