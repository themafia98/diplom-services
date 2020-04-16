import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const TitleModule = ({ title = '', className = '', classNameTitle = '', additional = '' }) => {
  return (
    <div className={clsx('titleModule', className ? className : null)}>
      <p className={clsx('titleModule_title', classNameTitle ? classNameTitle : null)}>{title}</p>
      {additional ? <span>{additional}</span> : null}
    </div>
  );
};

TitleModule.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  classNameTitle: PropTypes.string,
  additional: PropTypes.string,
};

export default TitleModule;
