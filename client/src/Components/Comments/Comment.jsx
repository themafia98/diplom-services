// @ts-nocheck
import React, { useState } from 'react';
import { commentType } from './types';
import { Icon, Tooltip } from 'antd';

const Comment = (props) => {
  const { onDelete, onEdit, rules, it, userId, uId } = props;
  const [key] = useState(it?.id ? it.id : Math.random());

  const onAction = (action, event) => {
    switch (action) {
      case 'delete':
        return onDelete(event, key);
      case 'edit':
        onEdit(event, key);
      default:
        return null;
    }
  };

  return (
    <p className="block-comment">
      {rules ? (
        <span className="commentControllers">
          {userId === uId ? (
            <>
              <Tooltip mouseEnterDelay={0.3} title="Редактировать сообщение">
                <Icon type="edit" onClick={onAction.bind(this, 'edit')} className="editComment " />
              </Tooltip>
              <Tooltip mouseEnterDelay={0.3} title="Удалить сообщение">
                <Icon type="delete" onClick={onAction.bind(this, 'delete')} className="deleteComment" />
              </Tooltip>
            </>
          ) : null}
        </span>
      ) : null}
      <span className="aboutCommentSender">
        <span className="timeComment">&nbsp;{it?.time}.</span>
        &nbsp;<span className="sender_name">{`${it?.username}`}</span> написал:
      </span>
      <span className="commentContet">{it?.message}</span>
    </p>
  );
};
Comment.defaultProps = {
  onDelete: null,
  rules: false,
  it: {},
  userId: '',
  uId: '',
};
Comment.propTypes = commentType;
export default Comment;
