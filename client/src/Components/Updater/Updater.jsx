import React from 'react';
import { updaterType } from './types';
import updater from './updater.png';
import { Tooltip } from 'antd';
import clsx from 'clsx';

const Updater = ({ className, additionalClassName, onClick }) => (
  <div className={clsx('updater', className)}>
    <Tooltip title="Обновить" placement="bottom">
      <img onClick={onClick} className={additionalClassName} alt="updater" src={updater}></img>
    </Tooltip>
  </div>
);

Updater.defaultProps = {
  className: '',
  additionalClassName: '',
  onClick: null,
};
Updater.propTypes = updaterType;
export default Updater;
