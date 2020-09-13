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

const Comments = memo(({ data, onUpdate, path, udata, clientDB, rules, commentProps }) => {
  const [updateDisabled, setDisable] = useState(false);
  const [msg, setValue] = useState(null);

  const { comments, key, _id: id } = data;
  const { displayName = '', _id: uId = '' } = udata;

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
            systemMessage: { done: 'Коментарий добавлен.', error: 'Комментарий добавить не удалось' },
          });

          setDisable(false);
          return;
        } catch (error) {
          console.error(error);
          notification.error({ message: 'Ошибка', description: 'Некоректные данные.' });
          setDisable(false);
        }
      }, 500),
    [clientDB, comments, data, id, key, msg, onUpdate, path, displayName, uId],
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
        systemMessage: { done: 'Коментарий успешно удален.', error: 'Комментарий удалить не удалось' },
      });
    } catch (error) {
      console.error(error);
      notification.error({ message: 'Ошибка', description: 'Некорректная операция.' });
    }
  };

  const onEdit = async (idComment, msg = null, callback = null) => {
    if (typeof msg !== 'string') {
      message.error('Сообщение не валидно.');
      if (callback) callback();
      return;
    }

    const commentIndex = comments.findIndex((item) => item?.id === idComment);
    if (commentIndex === -1) {
      message.error('Коментарий не существует.');
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
        systemMessage: { done: 'Коментарий успешно обновлен.', error: 'Комментарий обновить не удалось' },
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
      <Empty description={<span>Данных нету</span>} />
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
          Опубликовать
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
