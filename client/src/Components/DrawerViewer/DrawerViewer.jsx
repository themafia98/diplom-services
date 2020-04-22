// @ts-nocheck
import React from 'react';
import { drawerViewerType } from './types';
import { Drawer } from 'antd';
class DrawerViewer extends React.PureComponent {
  state = {};
  render() {
    const { onClose, visible } = this.props;
    return <Drawer onClose={onClose} title="Панель администратора" width={720} visible={visible}></Drawer>;
  }
}

DrawerViewer.propTypes = drawerViewerType;

export default DrawerViewer;
