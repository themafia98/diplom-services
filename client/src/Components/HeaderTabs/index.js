import React from 'react';
import { Layout } from 'antd';

const { Header } = Layout;


class HeaderTabs extends React.Component {
    render(){
        const { logout } = this.props;
        return (
            <Header style={{ background: '#fff', padding: 0 }} >
                <div onClick = {logout} className = 'logout'>Logout</div>
            </Header>
        );
    }
};

export default HeaderTabs;