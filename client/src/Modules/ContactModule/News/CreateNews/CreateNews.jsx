import React, { memo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { createNewsType } from '../../ContactModule.types';
import moment from 'moment';
import TitleModule from 'Components/TitleModule';
import EditorTextarea from 'Components/Textarea/EditorTextarea';
import { message, notification, Input } from 'antd';

import { createNotification, createEntity } from 'Utils/utils.global';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import { compose } from 'redux';
import { withClientDb } from 'Models/ClientSideDatabase';

const CreateNews = memo(({ statusApp, udata, onSetStatus, clientDB, readOnly }) => {
  const { displayName = '', _id: uid = '' } = udata;

  const [titleNews, setTitleNews] = useState('');
  const [clear, setClear] = useState(false);

  const clearStatus = () => {
    if (!clear) return;
    setClear(false);
  };

  const onChange = ({ currentTarget: { value = '' } = {} }) => {
    setTitleNews(value);
  };

  const onPublish = async (contentState) => {
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
      const res = await createEntity('news', body, { clientDB, statusApp, onSetStatus }, 0, 'createNews');

      const { result = {}, offline = false } = res || {};
      const { data = {} } = result;
      const { response = {} } = data;
      const { metadata = {}, params = {} } = response;

      const { done = false } = params;
      const { _id: id = '', key = '' } = metadata;

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

      setClear(true);
      message.success('Новость создана.');
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
      notification.error({
        title: 'Ошибка создания новой новости',
        message: 'Возможно данные повреждены',
      });
    }
  };

  return (
    <div className="createNews">
      <TitleModule classNameTitle="createNewsTitle" title="Создание новой новости" />
      <div className="createNews__main">
        <Input autoFocus={true} value={titleNews} onChange={onChange} placeholder="Заголовок новости" />

        <EditorTextarea
          disabled={readOnly}
          clearStatus={clearStatus}
          clear={clear}
          onPublish={onPublish}
          mode="createNewsEdit"
        />
      </div>
    </div>
  );
});

CreateNews.propTypes = createNewsType;
CreateNews.defaultProps = {
  statusApp: 'online',
  readOnly: '',
  udata: {},
  onSetStatus: null,
  clientDB: null,
};

export default compose(withClientDb)(moduleContextToProps(CreateNews));
