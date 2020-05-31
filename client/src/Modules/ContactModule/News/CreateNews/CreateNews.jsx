import React from 'react';
import { v4 as uuid } from 'uuid';
import { createNewsType } from '../../types';
import moment from 'moment';
import TitleModule from 'Components/TitleModule';
import EditorTextarea from 'Components/Textarea/EditorTextarea';
import { message, notification, Input } from 'antd';
import modelContext from 'Models/context';

import { createNotification, createEntity } from 'Utils';

class CreateNews extends React.PureComponent {
  state = {
    titleNews: '',
    clear: false,
  };

  static contextType = modelContext;
  static propTypes = createNewsType;

  setEditorValue = (event) => {
    this.setState({
      editorValue: event,
    });
  };

  clearStatus = (event) => {
    const { clear } = this.state;
    if (clear)
      this.setState({
        clear: false,
      });
  };

  onChange = ({ currentTarget: { value = '' } = {} }) => {
    this.setState({
      ...this.state,
      titleNews: value,
    });
  };

  onPublish = async (contentState) => {
    const { statusApp = '', udata: { displayName = '', _id: uid = '' } = {}, onSetStatus } = this.props;
    const { titleNews = '' } = this.state;
    const { clientDB = null } = this.context;

    if (!contentState) {
      return message.error('Ничего не найдено');
    }

    if (!titleNews) {
      return message.error('Название не найдено');
    }

    if (statusApp === 'online') {
      try {
        const body = {
          queryParams: {
            actionPath: 'news',
            actionType: 'create_single_news',
          },
          metadata: { title: titleNews, content: contentState, key: uuid() },
        };
        const res = await createEntity('news', body, { clientDB, statusApp, onSetStatus });
        const { result: { data = {} } = {}, offline = false } = res || {};
        const { response = {} } = data || {};
        const { metadata: { _id: id = '', key = '' } = {}, params: { done = false } = {} } = response;

        if (!done && !offline) {
          throw new Error('Bad create news');
        }

        if (!offline) {
          const itemNotification = {
            type: 'global',
            title: 'Новость',
            isRead: false,
            message: `${titleNews}. Добавлена: ${moment().format('MM.DD.YYYY HH:mm')}`,
            action: {
              type: 'news_link',
              moduleName: 'contactModule',
              link: id ? id : key,
            },
            uidCreater: uid,
            authorName: displayName,
          };

          createNotification('global', itemNotification).catch((error) => {
            if (error?.response?.status !== 404) console.error(error);
            message.error('Error create notification');
          });
        }

        this.setState(
          {
            ...this.state,
            clear: true,
          },
          () => message.success('Новость создана.'),
        );
      } catch (error) {
        if (error?.response?.status !== 404) console.error(error);
        notification.error({
          title: 'Ошибка создания новой новости',
          message: 'Возможно данные повреждены',
        });
      }
    } else
      return notification.error({
        title: 'Ошибка сети',
        message: 'Интернет соединение отсутствует',
      });
  };
  render() {
    const { clear = false, titleNews = '' } = this.state;
    const { readOnly = '' } = this.props;
    return (
      <div className="createNews">
        <TitleModule classNameTitle="createNewsTitle" title="Создание новой новости" />
        <div className="createNews__main">
          <Input
            autoFocus={true}
            value={titleNews}
            onChange={this.onChange}
            placeholder="Заголовок новости"
          />

          <EditorTextarea
            disabled={readOnly}
            clearStatus={this.clearStatus}
            clear={clear}
            onPublish={this.onPublish}
            mode="createNewsEdit"
          />
        </div>
      </div>
    );
  }
}

export default CreateNews;
