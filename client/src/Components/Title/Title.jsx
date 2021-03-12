import React from 'react';
import { titleType } from './Title.types';
import clsx from 'clsx';

const Title = ({ title, className, classNameTitle, additional }) => (
  <div className={clsx('title', className)}>
    <p className={clsx('title_title', classNameTitle)}>{title}</p>
    {additional ? <span>{additional}</span> : null}
  </div>
);

Title.defaultProps = {
  title: '',
  className: '',
  classNameTitle: '',
  additional: '',
};
Title.propTypes = titleType;
export default Title;
