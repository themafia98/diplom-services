// @ts-nocheck
import React, { useState, useContext } from 'react';
import { newsViewType } from '../../types';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';

import TitleModule from '../../../../Components/TitleModule';
import EditorTextarea from '../../../../Components/Textarea/EditorTextarea';
import modelContext from '../../../../Models/context';

const NewsViewPage = (props) => {
  const { content: contentEntity, title, id: _id } = props;
  const { schema = {} } = useContext(modelContext);
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
        <EditorTextarea key={id} readOnly={true} contentState={getNormalizeContent()} />
      </div>
    </div>
  );
};

NewsViewPage.defaultProps = {
  visible: false,
  isBackground: false,
  content: {},
  title: '',
  id: uuid(),
};
NewsViewPage.propTypes = newsViewType;
export default NewsViewPage;
