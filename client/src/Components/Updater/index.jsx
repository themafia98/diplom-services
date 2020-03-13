import React from 'react';
import PropTypes from 'prop-types';
import updater from './updater.png';
import { Tooltip } from 'antd';
import clsx from 'clsx';

const Updater = ({ className = null, additionalClassName = null, onClick = null }) => {
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

Updater.propTypes = {
  className: PropTypes.string,
  additionalClassName: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default Updater;
