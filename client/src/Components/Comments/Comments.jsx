import React from 'react';
import { commentsContainerType } from './types';
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

class Comments extends React.PureComponent {
  state = {
    onUpdateDisabled: false,
    value: null,
  };

  static propTypes = commentsContainerType;
  static defaultProps = {
    data: {},
    udata: {},
    rules: true,
  };

  addCommentsDelay = _.debounce(async (event) => {
    try {
      const { value: msg = '' } = this.state;
      const {
        onUpdate,
        data: { key = '', comments = [], _id: id = '' } = {},
        data = {},
        path,
        udata: { displayName = '', _id: uId = '' } = {},
        clientDB,
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
    const {
      path,
      onUpdate,
      data: { _id: id = '', key = '', comments = [] } = {},
      data = {},
      clientDB,
    } = this.props;
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

  onEdit = async (idComment, msg = null, callback = null) => {
    const {
      onUpdate,
      data: { _id: id = '', key = '', comments = [] } = {},
      data = {},
      path,
      clientDB,
    } = this.props;

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

  onChange = (event) => {
    const { target: { value = '' } = {} } = event;
    this.setState({
      ...this.state,
      value: value,
    });
  };

  renderComments = (commentsArray) => {
    const { rules, udata: { _id: userId = '' } = {}, commentProps = {} } = this.props;

    return commentsArray?.length ? (
      commentsArray.map((it) => (
        <Comment
          key={it.id}
          rules={rules}
          it={it}
          userId={userId}
          onDelete={this.onDelete}
          onEdit={this.onEdit}
          {...commentProps}
        />
      ))
    ) : (
      <Empty description={<span>Данных нету</span>} />
    );
  };
  render() {
    const { data: { comments = [] } = {} } = this.props;
    const { onUpdateDisabled, value } = this.state;

    return (
      <div className="comments">
        <div className="commnetsListBox">
          <Scrollbars autoHide hideTracksWhenNotNeeded>
            {this.renderComments(comments)}
          </Scrollbars>
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
export default withClientDb(Comments);
