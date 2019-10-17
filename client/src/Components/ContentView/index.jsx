import React from 'react';
import $ from "jquery";
import { Layout } from 'antd';

import MainModuleComponent from '../Modules/MainModuleComponent';

const { Content } = Layout;

class ContentView extends React.Component {

    getComponentByMode = mode => {
        if (mode === 'mainModule') return <MainModuleComponent />;
        else return <div>Not found module: ${mode}</div>
    }

    disableF5 = event => {
       if ((event.which || event.keyCode) == 116) event.preventDefault();
    }

    componentDidMount = () => {
        $(document).on("keydown", this.disableF5);
    }

    componentWillUnmount = () => {
        $(document).off("keydown");
    }

    render(){
        const { mode } = this.props;
        return (
            <Content>
                {this.getComponentByMode(mode)}
            </Content>
        );
    }
};

export default ContentView;