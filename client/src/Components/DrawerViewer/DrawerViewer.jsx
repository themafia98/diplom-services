// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { getComponentByKey } from '../../Utils';
import { drawerViewerType } from './types';
import { Drawer } from 'antd';

const DrawerViewer = (props) => {
  const { onClose, visible, title, selectedEntity, contentKey, moduleProps, udata } = props;
  const [content, setContent] = useState(selectedEntity);

  useEffect(() => {
    if (content !== selectedEntity) {
      setContent(selectedEntity);
    }
  }, [selectedEntity, content]);

  const Component = useMemo(() => getComponentByKey(contentKey), [contentKey]);

  if (!content) return null;

  return (
    <Drawer
      className={clsx('drawerViewer', contentKey)}
      key={`${contentKey}-drawer`}
      onClose={onClose}
      title={title}
      width={720}
      visible={visible}
      destroyOnClose={true}
    >
      {Component ? (
        <Component
          key={contentKey}
          {...moduleProps}
          visibleMode="drawerViewer"
          contentDrawer={content}
          udata={udata}
        />
      ) : (
        <span>{content.toString()}</span>
      )}
    </Drawer>
  );
};

DrawerViewer.propTypes = drawerViewerType;
DrawerViewer.defaultProps = {
  onClose: null,
  visible: false,
  title: '',
  selectedEntity: null,
  contentKey: '',
  udata: {},
  moduleProps: {},
};

export default DrawerViewer;
