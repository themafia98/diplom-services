import React from 'react';
import { Menu, Layout, Icon } from 'antd';

const { Sider } = Layout;
const { SubMenu } = Menu;

const MenuView = ({collapsed, cbOnCollapse}) => {
    return (
        <Sider collapsible collapsed={collapsed} onCollapse = {cbOnCollapse} >
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1">
            <Icon type="pie-chart" />
            <span>1</span>
          </Menu.Item>
          <Menu.Item key="2">
            <Icon type="desktop" />
            <span>2</span>
          </Menu.Item>
          <SubMenu
            key="sub1"
            title={
              <span>
                <Icon type="user" />
                <span>3</span>
              </span>
            }
          >
            <Menu.Item key="3">3.1</Menu.Item>
            <Menu.Item key="4">3.2</Menu.Item>
            <Menu.Item key="5">3.3</Menu.Item>
          </SubMenu>
          <SubMenu
            key="sub2"
            title={
              <span>
                <Icon type="team" />
                <span>4</span>
              </span>
            }
          >
            <Menu.Item key="6">4.1</Menu.Item>
            <Menu.Item key="8">4.2</Menu.Item>
          </SubMenu>
          <Menu.Item key="9">
            <Icon type="file" />
            <span>5</span>
          </Menu.Item>
        </Menu>
      </Sider>
    );
};

export default MenuView;