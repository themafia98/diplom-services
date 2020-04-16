import React from 'react';
import clsx from 'clsx';
import { Avatar } from 'antd';
const NotificationItem = ({ image = false, content = '', authorName = '' }) => {
  return (
    <div className={clsx('notificationItem', image ? null : 'centerContent')}>
      {image ? (
        <div className="right">
          <Avatar shape="circle" type="small" icon="user" />
        </div>
      ) : null}
      <span className={clsx('notificationItem__content', image ? 'left' : null)}>{content}</span>
      {authorName ? (
        <React.Fragment>
          <p className="title_author">Автор уведомления:</p>
          <p className="author">{authorName}</p>
        </React.Fragment>
      ) : null}
    </div>
  );
};

export default NotificationItem;
