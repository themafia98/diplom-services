import React from 'react';
import config from '../../../config.json';
import { Layout } from 'antd';
import { connect } from 'react-redux';

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

    render(){

      const { menuItems = null } = this.state;

        return (
            <Layout className = 'layout_menu'>
              <MenuView
                items = {menuItems} 
                collapsed = {this.state.collapsed} 
                cbOnCollapse = {this.onCollapse} 
              />
              <Layout>
                <HeaderView items = {menuItems} logout = {this.logout} />
                  <ContentView />
                <Footer>{config['title']}</Footer>
              </Layout>
            </Layout>
          );
    }
};

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = (dispatch, props) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(UserPanel);