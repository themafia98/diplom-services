import React from 'react';
import config from '../../../config.json';
import { Layout } from 'antd';
import { connect } from 'react-redux';
import { updatePathAction, addTabAction, setActiveTabAction, removeTabAction } from '../../../Redux/actions/routerActions';

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
        
      for (let i = 0; i < tabsCopy.length; i ++){
        const tabItem= menu.find(tab => tab.EUID === tabsCopy[i]);
        if (tabItem) tabsArray.push({...tabItem});
      }
      return tabsArray;
    }

    menuHandler = (event, key, mode = 'open') => {
      const path = event['key'] ? event['key'] : key;
      const { router:{ currentActionTab, actionTabs = [] } = {}, addTab, setCurrentTab, removeTab } = this.props;
      const actionTabsCopy = [...actionTabs];
      const isFind = actionTabsCopy.findIndex(tab => tab === path) !== -1;
      if (mode === 'open'){
        if (!isFind) addTab(path);
        else if (currentActionTab !== path){
          setCurrentTab(path);
        }
      } else if (mode === 'close'){
        if (isFind) removeTab(path);
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
    removeTab: (tab) =>  dispatch (removeTabAction(tab)),
    setCurrentTab: (tab) => dispatch (setActiveTabAction(tab)),
	}

}

export default connect(mapStateToProps, mapDispatchToProps)(UserPanel);