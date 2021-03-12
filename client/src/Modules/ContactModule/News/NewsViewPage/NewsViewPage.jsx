import React, { useState, useMemo, useEffect } from 'react';
import { newsViewType } from '../../ContactModule.types';
import Title from 'Components/Title';
import Textarea from 'Components/Textarea';
import { Spin } from 'antd';
import classes from './newsViewPage.module.scss';
import { useTranslation } from 'react-i18next';

const NewsViewPage = ({ id: newsId, listdata, _id: preloadId, entityId, onLoadingData }) => {
  const { content: contentEntity = {}, title = '' } = listdata || {};

  const { t } = useTranslation();
  const [id, setId] = useState(newsId);

  useEffect(() => {
    if (entityId && newsId === null) {
      setId(entityId);
      return;
    }

    if (!entityId && !preloadId) {
      onLoadingData();
      return;
    }

    if (preloadId && !id && preloadId !== id) {
      setId(preloadId);
    }
  }, [preloadId, onLoadingData, id, entityId, newsId]);

  const contentState = useMemo(() => {
    const content = Object.keys(contentEntity).reduce((data, key) => {
      if (key.includes('entity') || key.includes('blocks')) {
        data[key] = Array.isArray(contentEntity[key])
          ? [...contentEntity[key]]
          : contentEntity[key] && typeof contentEntity[key] === 'object'
          ? { ...contentEntity[key] }
          : contentEntity[key];
      }
      return data;
    }, {});

    if (contentEntity && typeof contentEntity === 'object' && !contentEntity.entityMap) {
      content.entityMap = {};
    }

    if (contentEntity && typeof contentEntity === 'object' && !contentEntity.blocks) {
      content.blocks = [];
    }

    return content;
  }, [contentEntity]);

  if (!contentEntity && (contentEntity?.blocks || contentEntity?.entityMap)) return null;

  if (!id) return <Spin size="large" tip={t('news_view_loadingNewsData')} className={classes.spin} />;

  return (
    <article className="newsView-page">
      <Title
        classNameTitle="tittle_contactModule_pageNews"
        title={title ? title : `${t('news_view_name')} № ${id}`}
      />
      <div className="newsView-page__main">
        <Textarea editor={true} key={id} readOnly={true} contentState={contentState} />
      </div>
    </article>
  );
};

NewsViewPage.defaultProps = {
  isBackground: false,
  content: null,
  title: '',
  id: null,
};
NewsViewPage.propTypes = newsViewType;
export default NewsViewPage;
