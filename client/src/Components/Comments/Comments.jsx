import React, { memo, useMemo, useState } from 'react';
import { commentsContainerType } from './Comments.types';
import Scrollbars from 'react-custom-scrollbars';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { Button, Empty, message, notification } from 'antd';

import Textarea from 'Components/Textarea';
import Comment from './Comment';
import actionsTypes from 'actions.types';
import { routeParser } from 'Utils';
import { withClientDb } from 'Models/ClientSideDatabase';
import { useTranslation } from 'react-i18next';

const Comments = memo(({ data, onUpdate, path, udata, clientDB, rules, commentProps }) => {
  const { t } = useTranslation();
  const [updateDisabled, setDisable] = useState(false);
  const [msg, setValue] = useState(null);

  const { comments, key, _id: id } = data;
  const { displayName = '', _id: uId = '' } = udata;

  const addSystemMessage = useMemo(
    () => ({
      done: t('components_comments_messages_addCommentDone'),
      error: t('components_comments_errorAddComment'),
    }),
    [t],
  );

  const removeSystemMessage = useMemo(
    () => ({
      done: t('components_comments_messages_removeCommentDone'),
      error: t('components_comments_messages_errorRemoveComment'),
    }),
    [t],
  );

  const refreshSystemMessage = useMemo(
    () => ({
      done: t('components_comments_messages_refreshCommentDone'),
      error: t('components_comments_messages_errorRefreshComment'),
    }),
    [t],
  );

  const addCommentsDelay = useMemo(
    () =>
      _.debounce(async () => {
        try {
          if (!msg) return message.error('Вы ничего не ввели.');
          else if (!(key && Array.isArray(comments) && !_.isEmpty(data))) return;

          const time = moment().format('DD.MM.YYYY HH:mm');

          if (!uId || !time || !displayName) {
            throw new Error('Invalid data');
          }

          const comment = {
            id: uuid(),
            uId,
            time,
            username: displayName,
            message: msg,
          };

          setDisable(true);
          setValue('');

          const parsedRoutePath = routeParser({
            pageType: 'moduleItem',
            path,
          });

          await onUpdate({
            actionType: actionsTypes.$UPDATE_SINGLE,
            parsedRoutePath,
            key,
            id,
            updateBy: '_id',
            updateItem: [...comments, comment],
            updateField: 'comments',
            store: 'tasks',
            clientDB,
            systemMessage: addSystemMessage,
          });

          setDisable(false);
          return;
        } catch (error) {
          console.error(error);
          notification.error({
            message: t('globalMessages_error'),
            description: t('globalMessages_invalidData'),
          });
          setDisable(false);
        }
      }, 500),
    [msg, key, comments, data, uId, displayName, path, onUpdate, id, clientDB, addSystemMessage, t],
  );

  const addComments = (event) => {
    const { which, keyCode } = event;
    const isDefiend = which && keyCode;

    if (isDefiend && (which || keyCode) !== 13) return;

    if (isDefiend && (which || keyCode) === 13) {
      event.preventDefault();
    }

    addCommentsDelay(event);
  };

  const onDelete = async (event, idComment) => {
    try {
      const filterComments = comments.filter(({ id = '' }) => id !== idComment);

      const parsedRoutePath = routeParser({
        pageType: 'moduleItem',
        path,
      });

      await onUpdate({
        actionType: actionsTypes.$UPDATE_SINGLE,
        parsedRoutePath,
        id,
        key,
        item: data,
        store: 'tasks',
        updateBy: '_id',
        updateItem: filterComments,
        updateField: 'comments',
        clientDB,
        systemMessage: removeSystemMessage,
      });
    } catch (error) {
      console.error(error);
      notification.error({
        message: t('globalMessages_error'),
        description: t('components_comments_messages_badOper'),
      });
    }
  };

  const onEdit = async (idComment, msg = null, callback = null) => {
    if (typeof msg !== 'string') {
      message.error(t('components_comments_messages_invalidComment'));
      if (callback) callback();
      return;
    }

    const commentIndex = comments.findIndex((item) => item?.id === idComment);
    if (commentIndex === -1) {
      message.error(t('components_comments_messages_notComment'));
      if (callback) callback();
      return;
    }
    const newCommentsArray = [...comments];
    newCommentsArray[commentIndex] = { ...comments[commentIndex], message: msg };

    try {
      const parsedRoutePath = routeParser({
        pageType: 'moduleItem',
        path,
      });

      await onUpdate({
        actionType: actionsTypes.$UPDATE_SINGLE,
        parsedRoutePath,
        id,
        key,
        item: data,
        store: 'tasks',
        updateBy: '_id',
        updateItem: newCommentsArray,
        updateField: 'comments',
        clientDB,
        systemMessage: refreshSystemMessage,
      });

      if (callback) callback();
    } catch (error) {
      if (callback) callback();
      console.error(error);
      notification.error({ message: 'Ошибка', description: 'Некорректная операция.' });
    }
  };

  const onChange = ({ target }) => {
    const { value } = target;
    setValue(value);
  };

  const renderComments = (commentsArray) => {
    return commentsArray?.length ? (
      commentsArray.map((it) => (
        <Comment
          key={it.id}
          rules={rules}
          it={it}
          userId={uId}
          onDelete={onDelete}
          onEdit={onEdit}
          {...commentProps}
        />
      ))
    ) : (
      <Empty description={<span>{t('globalMessages_empty')}</span>} />
    );
  };

  return (
    <div className="comments">
      <div className="commnetsListBox">
        <Scrollbars autoHide hideTracksWhenNotNeeded>
          {renderComments(comments)}
        </Scrollbars>
      </div>
      <div className="comments__controllers">
        <Textarea
          className="comments_textarea_fild"
          onKeyDown={addComments}
          key="comments_textarea_fild"
          value={msg}
          onChange={onChange}
          rows={4}
        />
        <Button
          onClick={addComments}
          disabled={updateDisabled}
          loading={updateDisabled}
          className="sendCommentsButton"
          type="primary"
        >
          t({'components_comments_add'})
        </Button>
      </div>
    </div>
  );
});

Comments.propTypes = commentsContainerType;

Comments.defaultProps = {
  data: null,
  onUpdate: null,
  rules: false,
};

export default withClientDb(Comments);
