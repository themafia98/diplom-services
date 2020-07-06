import React, { useState } from 'react';
import { newsViewType } from '../../types';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';

import TitleModule from 'Components/TitleModule';
import Textarea from 'Components/Textarea';

const NewsViewPage = ({ id: _id, listdata: { content: contentEntity = {}, title = '' } = {} }) => {
  const [id] = useState(_id);

  const getNormalizeContent = () => {
    const content = Object.keys(contentEntity).reduce((data, key) => {
      if (key.includes('entity') || key.includes('blocks')) {
        const isArray = _.isArray(contentEntity[key]);
        const isObject = _.isPlainObject(contentEntity[key]);
        data[key] = isArray
          ? [...contentEntity[key]]
          : isObject
          ? { ...contentEntity[key] }
          : contentEntity[key];
      }
      return data;
    }, {});

    if (_.isPlainObject(contentEntity) && !contentEntity.entityMap) {
      content.entityMap = {};
    }

    if (_.isPlainObject(contentEntity) && !contentEntity.blocks) {
      content.blocks = [];
    }

    return content;
  };

  const isValidContent = contentEntity && (contentEntity?.blocks || contentEntity?.entityMap);
  if (!isValidContent) return null;

  return (
    <div className="newsView-page">
      <TitleModule classNameTitle="tittle_contactModule_pageNews" title={title ? title : `Новость № ${id}`} />
      <div className="newsView-page__main">
        <Textarea editor={true} key={id} readOnly={true} contentState={getNormalizeContent()} />
      </div>
    </div>
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
