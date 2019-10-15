import React from 'react';
import Tab from './Tab';
import { Layout } from 'antd';

const { Header } = Layout;


class HeaderView extends React.Component {

    renderTabs = items => {
        const { activeTabEUID, cbMenuTabHandler } = this.props;
        return (
            <ul  className = 'tabsMenu'>
                    {items.map(item => {
                        
                        return (
                            <Tab
                                hendlerTab = {cbMenuTabHandler}
                                active = {activeTabEUID === item.EUID} 
                                key = {item.EUID} 
                                itemKey = {item.EUID}
                                value = {item.VALUE} 
                            />
                        )
                        })
                    }
            </ul>
        );
    }

    render(){
        const { logout, actionTabs } = this.props;
        return (
            <Header  >
                {actionTabs ? this.renderTabs(actionTabs) : null}
                <div onClick = {logout} className = 'logout'>Logout</div>
            </Header>
        );
    }
};

export default HeaderView;