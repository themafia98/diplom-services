import React from 'react';
import config from '../../../config.json';
import { Layout } from 'antd';
import { connect } from 'react-redux';
import { updatePathAction, addTabAction, setActiveTabAction } from '../../../Redux/actions/routerActions';

import HeaderView from '../../HeaderView';
import ContentView from '../../ContentView';
import MenuView from '../../MenuView';

const { Footer } = Layout;

class UserPanel extends React.Component {

    state = {
        collapsed: false,
        menuItems: config.menu
    };

    onCollapse = collapsed => {
        this.setState({ collapsed });
      };
    
    logout = event => {
      
      const { firebase } = this.props;
      if (firebase) firebase.signOut()
      .then(() => this.props.history.push('/'));
    };

    getActionTabs = (tabs = [], menu) => {
      const tabsArray = [];
      for (let i = 0; i < menu.length; i ++){
        const tabItemIndex = tabs.findIndex(tab => tab.EUID === menu[i].EUID);
        if (tabItemIndex !== -1) tabsArray.push({... menu[i]});
      }
      return tabsArray;
    }

    menuHandler = event => {
      const { router:{ actionTabs = [] } = {}, addTab, setCurrentTab } = this.props;
      const isFind = actionTabs.findIndex(tab => tab.EUID === event.key) !== -1;
      if (!isFind) addTab({EUID: event.key}).then(() => setCurrentTab(event.key));
    };

    render(){

      const { menuItems = null } = this.state;
      const { router:{ actionTabs = [] } = {} } = this.props;

      const actionTabsData= this.getActionTabs(actionTabs, menuItems);

        return (
            <Layout className = 'layout_menu'>
              <MenuView
                items = {menuItems}
                cbMenuHandler = {this.menuHandler}
                collapsed = {this.state.collapsed} 
                cbOnCollapse = {this.onCollapse} 
              />
              <Layout>
                <HeaderView actionTabs = {actionTabsData} logout = {this.logout} />
                  <ContentView />
                <Footer>{config['title']}</Footer>
              </Layout>
            </Layout>
          );
    }
};

const mapStateToProps = state => {
	return {
		router: {...state.router}
	}
};

const mapDispatchToProps = dispatch => {
	return {
		moveTo: async (path) => await dispatch (updatePathAction(path)),
    addTab: async (tab) => await dispatch (addTabAction(tab)),
    setCurrentTab: async (tab) => await dispatch (setActiveTabAction(tab)),
	}

}

export default connect(mapStateToProps, mapDispatchToProps)(UserPanel);