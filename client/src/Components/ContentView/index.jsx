import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

class ContentView extends React.Component {
    render(){
        const { mode } = this.props;
        return (
            <Content>
                <div className = 'contentBox' >Content. {mode}</div>
            </Content>
        );
    }
};
export default ContentView;