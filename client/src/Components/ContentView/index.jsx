import React from 'react';
import { Layout } from 'antd';

import MainModuleComponent from '../Modules/MainModuleComponent';

const { Content } = Layout;

class ContentView extends React.Component {

    getComponentByMode = mode => {
        if (mode === 'mainModule') return <MainModuleComponent />;
        else return <div>Not found module: ${mode}</div>
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