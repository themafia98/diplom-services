// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getComponentByKey } from '../../Utils';
import { drawerViewerType } from './types';
import { Drawer } from 'antd';

const DrawerViewer = (props) => {
  const { onClose, visible, title = '', selectedEntity = null } = props;
  const [key, setKey] = useState(selectedEntity);

  useEffect(() => {
    if (key !== selectedEntity) {
      setKey(selectedEntity);
    }
  }, [selectedEntity, key]);

  if (!key) return null;
  // const Component = getComponentByKey('createTaskModule');

  return (
    <Drawer key={key} onClose={onClose} title={title} width={720} visible={visible} destroyOnClose={true}>
      <span>{key.toString()}</span>
    </Drawer>
  );
};

DrawerViewer.propTypes = drawerViewerType;
DrawerViewer.defaultProps = {
  onClose: null,
  visible: false,
  title: '',
  selectedEntity: null,
};

export default DrawerViewer;
