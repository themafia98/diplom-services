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
      const tabsCopy = [...tabs];
      const tabsArray = [];
      tabsCopy.sort((a,b) => a.ORDER - b.ORDER);

      for (let i = 0; i < menu.length; i ++){
        const tabItemIndex = tabsCopy.findIndex(tab => tab.EUID === menu[i].EUID);
        if (tabItemIndex !== -1) tabsArray.push({...menu[i], ORDER: tabsCopy[tabItemIndex].ORDER});
      }
      return tabsArray.sort((a,b) => a.ORDER - b.ORDER);
    }

    menuHandler = (event, key) => {
      
      const path = event['key'] ? event['key'] : key;
      const { router:{ currentActionTab, actionTabs = [] } = {}, addTab, setCurrentTab } = this.props;
      const actionTabsCopy = [...actionTabs];
      const isFind = actionTabsCopy.findIndex(tab => tab.EUID === path) !== -1;
      const lastOrder = actionTabsCopy.sort((a,b) => a.ORDER - b.ORDER)[actionTabsCopy.length-1].ORDER;
      if (!isFind) addTab({EUID: path, ORDER: lastOrder + 1});
      else if (currentActionTab !== path){
        setCurrentTab(path);
      }
    };

    render(){

      const { menuItems = null } = this.state;
      const { router:{ actionTabs = [], currentActionTab } = {} } = this.props;

      const actionTabsData = this.getActionTabs(actionTabs, menuItems);

        return (
            <Layout className = 'layout_menu'>
              <MenuView
                items = {menuItems}
                activeTabEUID = {currentActionTab} 
                cbMenuHandler = {this.menuHandler}
                collapsed = {this.state.collapsed} 
                cbOnCollapse = {this.onCollapse} 
              />
              <Layout>
                <HeaderView  
                    cbMenuTabHandler = {this.menuHandler}  
                    activeTabEUID = {currentActionTab} 
                    actionTabs = {actionTabsData} 
                    logout = {this.logout} 
                />
                  <ContentView key = {currentActionTab} mode = {currentActionTab} />
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
    addTab: (tab) =>  dispatch (addTabAction(tab)),
    setCurrentTab: (tab) => dispatch (setActiveTabAction(tab)),
	}

}

export default connect(mapStateToProps, mapDispatchToProps)(UserPanel);