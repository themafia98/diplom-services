import React from 'react';
import { titleType } from './types';
import clsx from 'clsx';

const TitleModule = props => {
  const { title, className, classNameTitle, additional } = props;
  return (
    <div className={clsx('titleModule', className ? className : null)}>
      <p className={clsx('titleModule_title', classNameTitle ? classNameTitle : null)}>{title}</p>
      {additional ? <span>{additional}</span> : null}
    </div>
  );
};

TitleModule.defaultProps = {
  title: '',
  className: '',
  classNameTitle: '',
  additional: '',
};
TitleModule.propTypes = titleType;
export default TitleModule;
