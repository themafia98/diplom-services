// @ts-nocheck
import React from 'react';
import { commentsContainerType } from './types';
import Scrollbars from 'react-custom-scrollbars';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { Button, Empty, message, notification } from 'antd';

import Textarea from '../Textarea';
import Comment from './Comment';

class Comments extends React.PureComponent {
  state = {
    onUpdateDisabled: false,
    value: null,
  };

  static propTypes = commentsContainerType;

  addCommentsDelay = _.debounce(async (event) => {
    try {
      const { value: msg = '' } = this.state;
      const {
        onUpdate,
        data: { key = '', comments = [], _id: id = '' } = {},
        data = {},
        udata: { displayName = '', _id: uId = '' } = {},
      } = this.props;

      if (!msg) return message.error('Вы ничего не ввели.');
      else if (key && Array.isArray(comments) && !_.isEmpty(data)) {
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

        this.setState({ ...this.state, onUpdateDisabled: true, value: '' });

        await onUpdate({
          key,
          id,
          updateBy: 'key',
          updateItem: [...comments, comment],
          updateField: 'comments',
          store: 'tasks',
        });

        message.success('Коментарий добавлен.');

        return this.setState({
          ...this.state,
          onUpdateDisabled: false,
        });
      } else return notification.error({ message: 'Ошибка', description: 'Некоректные данные.' });
    } catch (error) {
      console.error(error);
      notification.error({ message: 'Ошибка', description: 'Некоректные данные.' });
      this.setState({
        onUpdateDisabled: false,
      });
    }
  }, 500);

  addComments = (event) => {
    if ((event.which || event.keyCode) && (event.which || event.keyCode) !== 13) return;
    if ((event.which || event.keyCode) && (event.which || event.keyCode) === 13) {
      event.preventDefault();
    }
    this.addCommentsDelay(event);
  };

  onDelete = async (event, idComment) => {
    const { onUpdate, data: { _id: id = '', key = '', comments = [] } = {}, data = {} } = this.props;
    const filterComments = comments.filter((it) => it.id !== idComment);
    try {
      await onUpdate({
        id,
        key,
        item: data,
        store: 'tasks',
        updateBy: 'key',
        updateItem: filterComments,
        updateField: 'comments',
      });
      message.success('Коментарий удален.');
    } catch (error) {
      message.error('Не удалось удалить коментарий.');
    }
  };

  onEdit = async (event, idComment) => {
    const { onUpdate, data: { _id: id = '', key = '', comments = [] } = {}, data = {} } = this.props;
    const newComments = comments.map((it) => {
      const { id: idEntity = '' } = it || {};

      if (idEntity === idComment)
        return {
          ...it,
          message: 'Тестовое редактирование',
        };
      else return it;
    });

    try {
      await onUpdate({
        id,
        key,
        item: data,
        store: 'tasks',
        updateBy: 'key',
        updateItem: newComments,
        updateField: 'comments',
      });
      message.success('Коментарий обновлен.');
    } catch (error) {
      message.error('Не удалось обновить коментарий.');
    }
  };

  onChange = (event) => {
    const { target: { value = '' } = {} } = event;
    this.setState({
      ...this.state,
      value: value,
    });
  };

  renderComments(commentsArray) {
    const { rules, udata: { _id: userId = '' } = {} } = this.props;
    if (commentsArray.length && Array.isArray(commentsArray))
      return commentsArray.map((it) => (
        <Comment
          key={it.id}
          rules={rules}
          it={it}
          uId={it.uId ? it.uId : null}
          userId={userId}
          onDelete={this.onDelete}
          onEdit={this.onEdit}
        />
      ));
    else return <Empty description={<span>Данных нету</span>} />;
  }
  render() {
    const { data: { comments = [] } = {} } = this.props;
    const { onUpdateDisabled, value } = this.state;

    return (
      <div className="comments">
        <div className="commnetsListBox">
          <Scrollbars hideTracksWhenNotNeeded={true}>{this.renderComments(comments)}</Scrollbars>
        </div>
        <div className="comments__controllers">
          <Textarea
            className="comments_textarea_fild"
            onKeyDown={this.addComments}
            key="comments_textarea_fild"
            value={value}
            onChange={this.onChange}
            rows={4}
          />
          <Button
            onClick={this.addComments}
            disabled={onUpdateDisabled}
            loading={onUpdateDisabled}
            className="sendCommentsButton"
            type="primary"
          >
            Опубликовать
          </Button>
        </div>
      </div>
    );
  }
}
export default Comments;
