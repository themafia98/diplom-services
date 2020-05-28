import React from 'react';
import { updaterType } from './types';
import updater from './updater.png';
import { Tooltip } from 'antd';
import clsx from 'clsx';

const Updater = (props) => {
  const { className, additionalClassName, onClick } = props;
  return (
    <div className={clsx('updater', className ? className : null)}>
      <Tooltip title="Обновить" placement="bottom">
        <img
          onClick={onClick ? onClick : null}
          className={clsx(additionalClassName ? additionalClassName : null)}
          alt="updater"
          src={updater}
        ></img>
      </Tooltip>
    </div>
  );
};

Updater.defaultProps = {
  className: '',
  additionalClassName: '',
  onClick: null,
};
Updater.propTypes = updaterType;
export default Updater;
