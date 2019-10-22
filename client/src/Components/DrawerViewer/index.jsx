import React from "react";
import { Drawer } from "antd";
class DrawerViewer extends React.Component {
    state = {};
    render() {
        const { onClose, visible } = this.props;
        return <Drawer onClose={onClose} title="Панель администратора" width={720} visible={visible}></Drawer>;
    }
}

export default DrawerViewer;
