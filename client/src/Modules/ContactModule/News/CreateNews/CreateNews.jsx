import React, { memo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { createNewsType } from '../../ContactModule.types';
import moment from 'moment';
import Title from 'Components/Title';
import EditorTextarea from 'Components/Textarea/EditorTextarea';
import { message, notification, Input } from 'antd';

import { createNotification, createEntity } from 'Utils';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import { compose } from 'redux';
import { withClientDb } from 'Models/ClientSideDatabase';
import { APP_STATUS } from 'App.constant';
import { useTranslation } from 'react-i18next';

const CreateNews = memo(({ statusApp, udata, onSetStatus, clientDB, readOnly }) => {
  const { displayName = '', _id: uid = '' } = udata;

  const { t } = useTranslation();
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
      return message.error(t('news_create_messages_nameNotFound'));
    }

    if (statusApp !== APP_STATUS.ON) {
      notification.error({
        title: t('globalMessages_networkError'),
        message: t('globalMessages_webEmpty'),
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
          message.error(t('globalMessages_notificationCreateBad'));
        });
      }

      setClear(true);
      message.success(t('news_create_messages_newsCreate'));
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
      notification.error({
        title: t('news_create_messages_errorCreateNewNews'),
        message: t('news_create_messages_invalidData'),
      });
    }
  };

  return (
    <div className="createNews">
      <Title classNameTitle="createNewsTitle" title={t('news_create_title')} />
      <div className="createNews__main">
        <Input
          autoFocus={true}
          value={titleNews}
          onChange={onChange}
          placeholder={t('news_create_newNewsPlaceholder')}
        />
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
  statusApp: APP_STATUS.ON,
  readOnly: '',
  udata: {},
  onSetStatus: null,
  clientDB: null,
};

export default compose(withClientDb)(moduleContextToProps(CreateNews));
