import React from 'react';
import { v4 as uuid } from 'uuid';
import { createNewsType } from '../../types';
import moment from 'moment';
import TitleModule from 'Components/TitleModule';
import EditorTextarea from 'Components/Textarea/EditorTextarea';
import { message, notification, Input } from 'antd';

import { createNotification, createEntity } from 'Utils';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import { compose } from 'redux';
import { withClientDb } from 'Models/ClientSideDatabase';

class CreateNews extends React.PureComponent {
  state = {
    titleNews: '',
    clear: false,
  };

  static propTypes = createNewsType;

  clearStatus = () => {
    const { clear } = this.state;

    if (!clear) return;

    this.setState({
      ...this.state,
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
    const {
      statusApp = '',
      udata: { displayName = '', _id: uid = '' } = {},
      onSetStatus,
      clientDB,
    } = this.props;
    const { titleNews = '' } = this.state;

    if (!titleNews || !contentState) {
      return message.error('Название не найдено');
    }

    if (statusApp !== 'online') {
      notification.error({
        title: 'Ошибка сети',
        message: 'Интернет соединение отсутствует',
      });
      return;
    }

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

      if (!done && !offline) throw new Error('Bad create news');

      if (!offline) {
        const itemNotification = {
          type: 'global',
          title: 'Новость',
          isRead: false,
          message: `${titleNews}. Добавлена: ${moment().format('DD.MM.YYYY HH:mm')}`,
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

export default compose(withClientDb)(moduleContextToProps(CreateNews));
