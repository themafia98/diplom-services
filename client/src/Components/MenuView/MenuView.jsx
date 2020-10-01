import React, { useMemo } from 'react';
import { menuViewType } from './MenuView.types';
import { Menu, Layout, Icon } from 'antd';

import Logo from 'Components/Logo';

const { Sider } = Layout;
const { SubMenu } = Menu;

const MenuView = ({ collapsed, cbOnCollapse, items, cbMenuHandler, activeTabEUID, cbGoMain }) => {
  const { VALUE: defaultSelectedKeys = '' } = items?.[0] || {};
  const menuItems = useMemo(
    () =>
      items.reduce((acc, { EUID = '', ICON = '', VALUE = '', PARENT_CODE = null } = {}) => {
        if (PARENT_CODE !== null) return acc;

        const children = items.filter(({ PARENT_CODE = '' } = {}) => EUID === PARENT_CODE);

        if (children.length > 0) {
          return [
            ...acc,
            <SubMenu
              key={EUID}
              className="menuItem"
              title={
                <span>
                  {ICON ? <Icon type={ICON} /> : null}
                  <span>{VALUE}</span>
                </span>
              }
            >
              {children.map((child) => (
                <Menu.Item onClick={cbMenuHandler} key={child.EUID}>
                  {child.VALUE}
                </Menu.Item>
              ))}
            </SubMenu>,
          ];
        } else
          return [
            ...acc,
            <Menu.Item className="menuItem" onClick={cbMenuHandler} key={EUID}>
              {ICON ? <Icon type={ICON} /> : null}
              <span>{VALUE}</span>
            </Menu.Item>,
          ];
      }, []),
    [cbMenuHandler, items],
  );

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={cbOnCollapse}>
      <div className="logo" onClick={cbGoMain}>
        <Logo />
      </div>
      {items ? (
        <Menu
          selectedKeys={[activeTabEUID]}
          theme="dark"
          defaultSelectedKeys={[defaultSelectedKeys]}
          mode="inline"
        >
          {menuItems}
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
