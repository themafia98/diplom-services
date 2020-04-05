import React, { useState } from 'react';

const WikiPage = props => {
  const { selectedNode } = props;
  const [node] = useState(selectedNode);
  return <p>{JSON.stringify(node)}</p>;
};

export default WikiPage;
