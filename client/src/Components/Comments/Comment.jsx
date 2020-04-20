import React, { useState } from 'react';
import { commentType } from './types';

const Comment = (props) => {
  const { onDelete, rules, it, userId, uId } = props;
  const [key] = useState(it?.id ? it.id : Math.random());

  const onDeleteEvent = (event) => {
    onDelete(event, key);
  };

  return (
    <p className="block-comment">
      {rules ? (
        <span className="commentControllers">
          <span style={{ display: 'none' }} className="editComment icon-edit"></span>
          {userId === uId ? (
            <span onClick={onDeleteEvent} className="deleteComment icon-trash-empty"></span>
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
