// @ts-nocheck
import React, { useState } from 'react';
import { commentType } from './types';
import { Icon, Tooltip, Input, Button } from 'antd';

const Comment = (props) => {
  const { onDelete, onEdit, rules, it, userId, uId } = props;
  const [key] = useState(it?.id ? it.id : it?._id);
  const [value, setValue] = useState(it?.message);
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  const onAction = (action, event) => {
    console.log(key);
    switch (action) {
      case 'delete':
        return onDelete(event, key);
      case 'edit': {
        if (!loading) setLoading(true);
        return onEdit(key, value, onReset);
      }
      default:
        return null;
    }
  };

  const onReset = () => {
    setLoading(false);
    onEditMode();
  };

  const onEditMode = () => setEditable(!editable);
  const onChange = ({ target: { value = '' } }) => setValue(value);

  return (
    <p className="block-comment">
      {rules ? (
        <span className="commentControllers">
          {userId === uId ? (
            <>
              <Tooltip mouseEnterDelay={0.3} title="Редактировать сообщение">
                <Icon type="edit" onClick={onEditMode} className="editComment " />
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
      {!editable ? (
        <span className="commentContet">{it?.message}</span>
      ) : (
        <div className="editable-container">
          <Input onChange={onChange} type="text" defaultValue={it?.message} value={value} />
          <Button
            disabled={loading}
            loading={loading}
            onClick={onAction.bind(this, 'edit')}
            size="small"
            type="primary"
          >
            Принять изменения
          </Button>
        </div>
      )}
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
