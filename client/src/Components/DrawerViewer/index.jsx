import React from "react";
import PropTypes from "prop-types";
import { Drawer } from "antd";
class DrawerViewer extends React.PureComponent {
    state = {};
    render() {
        const { onClose, visible } = this.props;
        return <Drawer onClose={onClose} title="Панель администратора" width={720} visible={visible}></Drawer>;
    }
}

DrawerViewer.propTypes = {
    onClose: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired
};

export default DrawerViewer;
