import React from 'react';
import { menuViewType } from './types';
import _ from 'lodash';
import { Menu, Layout, Icon } from 'antd';

import Logo from 'Components/Logo';

const { Sider } = Layout;
const { SubMenu } = Menu;

const MenuView = ({ collapsed, cbOnCollapse, items, cbMenuHandler, activeTabEUID, cbGoMain }) => {
  const renderMenu = (items) => {
    const parent = items.filter((parentItem) => {
      return _.isNull(parentItem.PARENT_CODE);
    });

    return parent.map((item) => {
      const children = items.filter((childParentItem) => {
        return item.EUID === childParentItem.PARENT_CODE;
      });
      if (children.length > 0) {
        return (
          <SubMenu
            key={item.EUID}
            className="menuItem"
            title={
              <span>
                {item.ICON ? <Icon type={item.ICON} /> : null}
                <span>{item.VALUE}</span>
              </span>
            }
          >
            {children.map((child) => (
              <Menu.Item onClick={cbMenuHandler} key={child.EUID}>
                {child.VALUE}
              </Menu.Item>
            ))}
          </SubMenu>
        );
      } else
        return (
          <Menu.Item className="menuItem" onClick={cbMenuHandler} key={item.EUID}>
            {item.ICON ? <Icon type={item.ICON} /> : null}
            <span>{item.VALUE}</span>
          </Menu.Item>
        );
    });
  };

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={cbOnCollapse}>
      <div className="logo" onClick={cbGoMain}>
        <Logo />
      </div>
      {items ? (
        <Menu
          selectedKeys={[activeTabEUID]}
          theme="dark"
          defaultSelectedKeys={[items[0].VALUE]}
          mode="inline"
        >
          {renderMenu(items)}
        </Menu>
      ) : null}
    </Sider>
  );
};

MenuView.defaultProps = {
  collapsed: false,
  cbOnCollapse: null,
  items: [],
  cbMenuHandler: null,
  activeTabEUID: '',
  cbGoMain: null,
};
MenuView.propTypes = menuViewType;

export default MenuView;
