import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { getComponentByKey } from 'Utils/utils.global';
import { drawerViewerType } from './DrawerViewer.types';
import { Drawer } from 'antd';
import types from 'types.modules';

const DrawerViewer = ({
  onClose,
  visible,
  title,
  selectedEntity,
  contentKey,
  moduleProps,
  udata,
  contentType,
}) => {
  const [content, setContent] = useState(selectedEntity);

  useEffect(() => {
    if (content !== selectedEntity) {
      setContent(selectedEntity);
    }
  }, [selectedEntity, content]);

  const Component = useMemo(() => getComponentByKey(contentKey, contentType), [contentKey, contentType]);

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
        <span>{content?.toString()}</span>
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
  contentType: types.$entrypoint_module,
};

export default DrawerViewer;
