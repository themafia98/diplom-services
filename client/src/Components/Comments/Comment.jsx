import React, { useState, useCallback } from 'react';
import { commentType } from './types';
import Output from 'Components/Output';
import { Icon, Tooltip, Input, Button } from 'antd';

const Comment = ({
  onDelete,
  onEdit,
  rules,
  it,
  userId,
  router,
  removeTab,
  udata,
  onOpenPageWithData,
  setCurrentTab,
}) => {
  const { id = '', message = '', time = '', uId = '', username = '' } = it;

  const [value, setValue] = useState(message);
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(false);

  const onEditMode = useCallback(() => setEditable(!editable), [editable]);

  const onReset = useCallback(() => {
    setLoading(false);
    onEditMode();
  }, [onEditMode]);

  const onAction = useCallback(
    (action, event) => {
      switch (action) {
        case 'delete':
          return onDelete(event, id);
        case 'edit': {
          if (!loading) setLoading(true);
          return onEdit(id, value, onReset);
        }
        default:
          return null;
      }
    },
    [id, loading, onDelete, onEdit, onReset, value],
  );

  const onChange = ({ target: { value = '' } }) => setValue(value);

  return (
    <div className="block-comment">
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
        <span className="timeComment">&nbsp;{time}.</span>
        &nbsp;
        <Output
          action="cabinet"
          typeOutput="link"
          depDataKey="global"
          router={router}
          removeTab={removeTab}
          udata={udata}
          id={uId}
          isStaticList={true}
          onOpenPageWithData={onOpenPageWithData}
          setCurrentTab={setCurrentTab}
          className="sender_name"
          outputClassName="output--inline"
        >
          {username}
        </Output>
        написал:
      </span>
      {!editable ? (
        <span className="commentContet">{message}</span>
      ) : (
        <div className="editable-container">
          <Input onChange={onChange} type="text" defaultValue={message} value={value} />
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
    </div>
  );
};
Comment.defaultProps = {
  rules: false,
  router: {},
  udata: {},
  it: {},
  userId: '',
  uId: '',
  onDelete: null,
  onEdit: null,
  removeTab: null,
  onOpenPageWithData: null,
  setCurrentTab: null,
};
Comment.propTypes = commentType;
export default Comment;
