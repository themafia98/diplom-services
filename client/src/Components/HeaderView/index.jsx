import React from 'react';
import Tab from './Tab';
import { Layout } from 'antd';

const { Header } = Layout;


class HeaderView extends React.Component {

    renderTabs = items => {
        return (
            <ul  className = 'tabsMenu'>
            {items.map(item => {
                return (
                    <Tab key = {item.value} value = {item.value} selected = {item.selected} />
                )
                })
            }
            </ul>
        );
    }

    render(){
        const { logout, items } = this.props;
        return (
            <Header  >
                {items ? this.renderTabs(items) : null}
                <div onClick = {logout} className = 'logout'>Logout</div>
            </Header>
        );
    }
};

export default HeaderView;