import React from 'react';
import { Menu, Layout, Icon } from 'antd';

const { Sider } = Layout;
const { SubMenu } = Menu;

const MenuView = ({collapsed, cbOnCollapse, items}) => {

    const renderMenu = items => {
      if (items.length)
        return items.map(item => {
          if (item.children){
            const children = item.children;
            return (
                <SubMenu
                key={item.EUID}
                title={
                  <span>
                    {item.icon ? <Icon type={item.icon} /> : null}
                    <span>{item.value}</span>
                  </span>
                }
              >
              {item.children.map(child => <Menu.Item key = {child.EUID}>{child.value}</Menu.Item>)}
              </SubMenu>
            );
          } else return (
                <Menu.Item selected = {item.selected} key={item.value}>
                    {item.icon ? <Icon type={item.icon} /> : null}
                    <span>{item.value}</span>
                </Menu.Item>
          )
        });
    };

        return (
            <Sider collapsible collapsed={collapsed} onCollapse = {cbOnCollapse} >
            <div className="logo" />
            {items ? <Menu theme="dark" defaultSelectedKeys={[items[0].value]} mode="inline">
                {renderMenu(items)}
            </Menu>
             : null}
          </Sider>
        );
};

export default MenuView;

