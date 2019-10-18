import React from 'react';
import $ from "jquery";
import { Layout } from 'antd';

import MainModuleComponent from '../Modules/MainModuleComponent';

const { Content } = Layout;

class ContentView extends React.Component {

    state = {
        key: Math.random(),
    }

    getComponentByMode = mode => {
        if (mode === 'mainModule') return <MainModuleComponent />;
        else return <div>Not found module: ${mode}</div>
    }

    disableF5 = event => {
       if ((event.which || event.keyCode) === 116){
            event.preventDefault();
            return  this.setState({ key: Math.random() });
       }
    }

    componentDidMount = () => {
        $(document).on("keydown", this.disableF5);
    }

    componentWillUnmount = () => {
        $(document).off("keydown");
    }

    render(){
        const { mode } = this.props;
        const { key } = this.state;
        return (
            <Content key = {key}>
                {this.getComponentByMode(mode)}
            </Content>
        );
    }
};

export default ContentView;