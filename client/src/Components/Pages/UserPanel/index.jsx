import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import { connect } from 'react-redux';

import HeaderTabs from '../../HeaderTabs';
import ContentZone from '../../ContentZone';
import MenuSide from '../../Menu';

const { Footer } = Layout;

class UserPanel extends React.Component {

    state = {
        collapsed: false,
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
      
        return (
            <Layout className = 'layout_menu'>
              <MenuSide collapsed = {this.state.collapsed} cbOnCollapse = {this.onCollapse} />
              <Layout>
                <HeaderTabs logout = {this.logout} />
                <ContentZone />
                <Footer>Test layout</Footer>
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