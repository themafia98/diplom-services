// @ts-nocheck
import React from 'react';
import { drawerViewerType } from './types';
import { Drawer } from 'antd';
class DrawerViewer extends React.PureComponent {
  state = {};
  render() {
    const { onClose, visible, title = '' } = this.props;
    return <Drawer onClose={onClose} title={title} width={720} visible={visible} />;
  }
}

DrawerViewer.propTypes = drawerViewerType;

export default DrawerViewer;
