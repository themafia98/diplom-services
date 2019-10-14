import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

class ContentView extends React.Component {
    render(){
        return (
            <Content>
                <div className = 'contentBox' >Content.</div>
            </Content>
        );
    }
};
export default ContentView;