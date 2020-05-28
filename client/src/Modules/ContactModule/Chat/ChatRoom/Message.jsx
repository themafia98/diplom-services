import React from 'react';
import { messageType } from '../../types';
import { Tooltip } from 'antd';

const Message = ({ it = null, children = null, showTooltip, className = '' }) => {
  if (!it) return null;

  return showTooltip ? (
    <Tooltip placement="top" key={`${it.id}_tooltip`} visible={showTooltip} title="Перейти в профиль">
      <span className={className}>{children}</span>
    </Tooltip>
  ) : (
    <span className={className}>{children}</span>
  );
};

Message.defauultProps = {
  it: null,
  children: null,
  showTooltip: false,
  className: '',
};

Message.propTypes = messageType;

export default Message;
