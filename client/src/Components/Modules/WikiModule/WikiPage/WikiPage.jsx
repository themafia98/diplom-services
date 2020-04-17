import React, { useState, useContext, useEffect } from 'react';
import { wikiPageTypes } from './types';
import modelContext from '../../../../Models/context';

const WikiPage = props => {
  const { selectedNode = null, metadata = null } = props;
  const models = useContext(modelContext);

  const [statusPage, setStatus] = useState(0);
  const [node] = useState(selectedNode);
  const [nodeMetadata] = useState(metadata);

  const fetchWikiPage = async () => {
    try {
      const { Request } = models;
      const rest = new Request();
      console.log('fetch');
    } catch (error) {
      console.error(error);
      if (statusPage) setStatus(0);
    }
  };

  useEffect(() => {
    fetchWikiPage();
  }, [node, nodeMetadata]);

  const { title = '' } = nodeMetadata || {};

  return (
    <div className="wikiPage">
      <h3 className="wikiPage__title">{title}</h3>
    </div>
  );
};

WikiPage.propTypes = wikiPageTypes;
export default WikiPage;
