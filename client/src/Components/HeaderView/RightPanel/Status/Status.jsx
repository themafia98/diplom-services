import React from 'react';
import { statusType } from '../../types';
import clsx from 'clsx';
import { Icon } from 'antd';

const Status = ({ statusApp = '', shouldUpdate = false }) => {
  return (
    <div className="statusApp">
      {shouldUpdate ? <Icon type="loading" /> : null}
      <div className={clsx('statusAppIcon', statusApp)}></div>
    </div>
  );
};

Status.propTypes = statusType;

export default Status;
