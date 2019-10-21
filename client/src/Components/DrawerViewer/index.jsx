import React from "react";
import { Drawer } from "antd";
class DrawerViewer extends React.Component {
    state = {
        visible: this.props.visible ? this.props.visible : false,
    };

    componentDidMount = () => {
        let test = new XMLHttpRequest();
        test.open("GET", `${process.env.REACT_APP_SERVER}api/hello`);
        test.send();
        test.onload = function() {
            debugger;
            console.log(this);
        };
    };

    static getDerivedStateToProps = (props, state) => {
        if (props.visible !== state.visible) return { ...this.state, visible: props.visible };
        else return null;
    };

    render() {
        const { onClose } = this.props;
        return <Drawer title="Панель администратора" width={720} visible={this.state.visible}></Drawer>;
    }
}

export default DrawerViewer;
