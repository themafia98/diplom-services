import React, { useState, useContext, useEffect, useCallback } from 'react';
import uuid from 'uuid/v4';
import Textarea from '../../../Textarea';
import { wikiPageTypes } from '../types';
import modelContext from '../../../../Models/context';
import { Spin, Button } from 'antd';
import moment from 'moment';

const WikiPage = props => {
  const { selectedNode = null, metadata = null, onChangeWikiPage } = props;
  const models = useContext(modelContext);

  const [pageId, setPageId] = useState(`${uuid()}_virtualPage`);
  const [lastEditName, setLastEdit] = useState(null);
  const [lastEditDate, setLastEditDate] = useState(null);
  const [readOnly, setReadOnly] = useState(true);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusPage, setStatus] = useState(0);
  const [node] = useState(selectedNode);
  const [nodeMetadata] = useState(metadata);

  const fetchWikiPageMethod = async () => {
    try {
      const { Request } = models;
      const { _id, path, accessGroups = [] } = nodeMetadata;
      const rest = new Request();
      const queryParams = {
        type: 'wikiPage',
        methodQuery: {
          _id,
          accessGroups,
        },
        params: {
          idEntity: _id,
          accessGroups,
          path,
        },
      };

      if (!loading) setLoading(true);
      const res = await rest.sendRequest('/wiki/wikiPage', 'POST', queryParams, true);

      if (res.status !== 200 || res.status !== 404) {
        throw new Error('bad fetch wikiPage data');
      }

      const { data: { response = {} } = {} } = res || {};
      const { content: contentState, pageId, lastEditName } = response;

      setLoading(false);
      setPageId(pageId);
      setLastEdit(lastEditName);
      setContent(contentState);
    } catch (error) {
      console.error(error.messsage);
      if (statusPage) setStatus(0);
      setLoading(false);
    }
  };

  const onChangeStateEditor = () => {
    setReadOnly(!readOnly);
  };

  const onSubmitChanges = () => {
    const paramsState = {
      pageId,
      lastEditName,
      content,
      lastEditDate: moment().format('DD.MM.YYYY HH:mm:ss'),
    };
    if (onChangeWikiPage) onChangeWikiPage(paramsState, onChangeStateEditor);
  };

  const fetchWikiPage = useCallback(fetchWikiPageMethod, []);

  useEffect(() => {
    fetchWikiPage();
  }, [node, nodeMetadata, fetchWikiPage]);

  const { title = '' } = nodeMetadata || {};

  const editorButton = (
    <Button onClick={onChangeStateEditor} type="primary">
      Редактировать страницу
    </Button>
  );

  return (
    <div className="wikiPage">
      <h2 className="wikiPage__title">{title}</h2>
      <div className="wikiPage-content">
        {loading ? (
          <Spin size="large" />
        ) : !content && readOnly ? (
          <div className="empty-wikiPage">
            {editorButton}
            <div className="empty-wikiPage__msg">Тут ничего нет</div>
          </div>
        ) : (
          <div className="wikiPage-content">
            <Textarea editor={true} editorKey={pageId} readOnly={readOnly} contentState={content} />
            {!readOnly ? (
              <Button type="primary" onClick={onSubmitChanges}>
                Принять изменения
              </Button>
            ) : content && readOnly ? (
              editorButton
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

WikiPage.propTypes = wikiPageTypes;
export default WikiPage;
