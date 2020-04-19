import React, { useState, useContext, useEffect, useCallback } from 'react';
import { wikiPageTypes } from '../types';
import modelContext from '../../../../Models/context';
import { Spin } from 'antd';

const WikiPage = props => {
  const { selectedNode = null, metadata = null } = props;
  const models = useContext(modelContext);

  const [data, setResponse] = useState(null);
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
      setResponse(response);
      setLoading(false);
    } catch (error) {
      console.error(error.messsage);
      if (statusPage) setStatus(0);
      setLoading(false);
    }
  };

  const fetchWikiPage = useCallback(fetchWikiPageMethod, []);

  useEffect(() => {
    fetchWikiPage();
  }, [node, nodeMetadata, fetchWikiPage]);

  const { title = '' } = nodeMetadata || {};

  return (
    <div className="wikiPage">
      <h2 className="wikiPage__title">{title}</h2>
      <div className="wikiPage-content">
        {loading ? <Spin size="large" /> : data ? <div>Тут ничего нет</div> : <p>{JSON.stringify(data)}</p>}
      </div>
    </div>
  );
};

WikiPage.propTypes = wikiPageTypes;
export default WikiPage;
