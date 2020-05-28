import React from 'react';
import { notificationItemType } from './types';
import clsx from 'clsx';
import { Avatar } from 'antd';

const NotificationItem = ({ image, content, authorName }) => {
  return (
    <div className={clsx('notificationItem', image ? null : 'centerContent')}>
      {image ? (
        <div className="right">
          <Avatar shape="circle" type="small" icon="user" />
        </div>
      ) : null}
      <span className={clsx('notificationItem__content', image ? 'left' : null)}>{content}</span>
      {authorName ? (
        <>
          <p className="title_author">Автор уведомления:</p>
          <p className="author">{authorName}</p>
        </>
      ) : null}
    </div>
  );
};

NotificationItem.defaultProps = {
  image: null,
  content: '',
  authorName: '',
};

NotificationItem.propTypes = notificationItemType;
export default NotificationItem;
