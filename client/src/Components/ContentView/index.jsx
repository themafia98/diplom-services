import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

class ContentView extends React.Component {
    render(){
        return (
            <Content style={{ margin: '16px 16px' }}>
                <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>Content.</div>
            </Content>
        );
    }
};
export default ContentView;