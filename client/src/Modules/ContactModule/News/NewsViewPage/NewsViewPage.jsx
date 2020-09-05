import React, { useState, useMemo } from 'react';
import { newsViewType } from '../../types';
import { v4 as uuid } from 'uuid';

import TitleModule from 'Components/TitleModule';
import Textarea from 'Components/Textarea';

const NewsViewPage = ({ id: _id, listdata }) => {
  const { content: contentEntity = {}, title = '' } = listdata || {};
  const [id] = useState(_id);

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

  return (
    <article className="newsView-page">
      <TitleModule classNameTitle="tittle_contactModule_pageNews" title={title ? title : `Новость № ${id}`} />
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
  id: uuid(),
};
NewsViewPage.propTypes = newsViewType;
export default NewsViewPage;
