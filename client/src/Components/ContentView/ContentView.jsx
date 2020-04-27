// @ts-nocheck
import React from 'react';
import { contentViewType } from './types';
import _ from 'lodash';
import { Layout } from 'antd';

import TabContainer from '../TabContainer';
import DrawerViewer from '../DrawerViewer';

import MainModule from '../../Modules/MainModule';
import CabinetModule from '../../Modules/CabinetModule';
import TaskModule from '../../Modules/TaskModule';
import StatisticsModule from '../../Modules/StatisticsModule';
import SettingsModule from '../../Modules/SettingsModule';
import ContactModule from '../../Modules/ContactModule';
import CustomersModule from '../../Modules/CustomersModule';
import WikiModule from '../../Modules/WikiModule';

import { v4 as uuid } from 'uuid';

const { Content } = Layout;

class ContentView extends React.Component {
  state = {
    drawerView: false,
    key: null,
  };

  static propTypes = contentViewType;

  componentDidMount = () => {
    const { dashboardStrem = null } = this.props;
    const { key = null } = this.state;
    document.addEventListener('keydown', this.disableF5);
    dashboardStrem.on('EventUpdate', this.updateFunction);
    if (_.isNull(key)) {
      this.setState({
        key: uuid(),
      });
    }
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    const { path: currentPath } = this.props;
    const { key: currentKey, drawerView: currentDrawerView } = this.state;
    if (
      nextProps.path !== currentPath ||
      nextState.key !== currentKey ||
      nextState.drawerView !== currentDrawerView
    ) {
      return true;
    } else return false;
  };

  componentWillUnmount = () => {
    const { dashboardStrem = null } = this.props;
    document.removeEventListener('keydown', this.disableF5);
    dashboardStrem.off('EventUpdate', this.updateFunction);
  };

  getBackground = (moduleName) => {
    return this.checkBackground(moduleName);
  };

  /**
   * @param {string} path
   */
  checkBackground = (path) => {
    const { actionTabs = [] } = this.props;
    /**
     * @param {string} actionTab
     */
    return actionTabs.some((actionTab) => actionTab.startsWith(path) || actionTab === path);
  };

  updateFunction = _.debounce((forceUpdate) => {
    const { updateLoader } = this.props;
    this.setState({ ...this.state, key: uuid() }, () => {
      if (forceUpdate) {
        updateLoader();
      }
    });
  }, 300);

  disableF5 = (event) => {
    if ((event.which || event.keyCode) === 113) {
      return this.setState({ ...this.state, drawerView: !this.state.drawerView });
    }
    if ((event.which || event.keyCode) === 116) {
      event.preventDefault();
      this.updateFunction(true);
    }
  };

  onClose = () => {
    return this.setState({ ...this.state, drawerView: false });
  };

  render() {
    const {
      path,
      onErrorRequestAction,
      setCurrentTab,
      actionTabs,
      router,
      statusApp,
      rest,
      onShowLoader,
      onHideLoader,
      onSetStatus,
    } = this.props;
    const { drawerView, key } = this.state;

    const loaderMethods = {
      onShowLoader,
      onHideLoader,
    };

    if (!key) return <div>no menu</div>;

    return (
      <>
        <Content key={key}>
          <TabContainer
            key="mainModule"
            isBackground={this.getBackground('mainModule')}
            visible={path === 'mainModule'}
          >
            <MainModule
              visible={path === 'mainModule'}
              rest={rest}
              onErrorRequestAction={onErrorRequestAction}
              loaderMethods={loaderMethods}
              setCurrentTab={setCurrentTab}
              key="mainModule"
            />
          </TabContainer>
          <TabContainer
            key={path?.includes('personal') ? 'cabinetModulePersonal' : 'cabinetModule'}
            isBackground={this.getBackground('cabinetModule')}
            visible={path.startsWith('cabinetModule')}
          >
            <CabinetModule
              visible={path.startsWith('cabinetModule')}
              rest={rest}
              loaderMethods={loaderMethods}
              onErrorRequestAction={onErrorRequestAction}
              path={path}
              key={path?.includes('personal') ? 'cabinetModulePersonal' : 'cabinetModule'}
            />
          </TabContainer>
          <TabContainer
            path={'taskModule'}
            key="taskModule"
            isBackground={this.getBackground('taskModule')}
            visible={path.startsWith('taskModule')}
          >
            <TaskModule
              visible={path.startsWith('taskModule')}
              onErrorRequestAction={onErrorRequestAction}
              setCurrentTab={setCurrentTab}
              key="taskModule"
              rest={rest}
              loaderMethods={loaderMethods}
              path={path}
            />
          </TabContainer>
          <TabContainer isBackground={this.getBackground('wikiModule')} visible={path === 'wikiModule'}>
            <WikiModule
              visible={path === 'wikiModule'}
              onErrorRequestAction={onErrorRequestAction}
              key="wikiModule"
              path={path}
              loaderMethods={loaderMethods}
              rest={rest}
              statusApp={statusApp}
            />
          </TabContainer>
          <TabContainer
            isBackground={this.getBackground('contactModule')}
            visible={path.startsWith('contactModule')}
          >
            <ContactModule
              visible={path.startsWith('contactModule')}
              actionTabs={actionTabs}
              statusApp={statusApp}
              router={router}
              rest={rest}
              onSetStatus={onSetStatus}
              loaderMethods={loaderMethods}
              onErrorRequestAction={onErrorRequestAction}
              key="contact"
              path={path}
            />
          </TabContainer>
          <TabContainer
            isBackground={this.getBackground('customersModule')}
            visible={path.startsWith('customersModule')}
          >
            <CustomersModule
              visible={path.startsWith('customersModule')}
              onErrorRequestAction={onErrorRequestAction}
              actionTabs={actionTabs}
              rest={rest}
              onSetStatus={onSetStatus}
              router={router}
              loaderMethods={loaderMethods}
              key="customers"
              path={path}
            />
          </TabContainer>
          <TabContainer
            isBackground={this.getBackground('settingsModule')}
            visible={path === 'settingsModule'}
          >
            <SettingsModule
              visible={path === 'settingsModule'}
              onErrorRequestAction={onErrorRequestAction}
              key="settings"
              loaderMethods={loaderMethods}
              rest={rest}
              path={path}
            />
          </TabContainer>
          <TabContainer
            isBackground={this.getBackground('statisticModule')}
            visible={path === 'statisticModule'}
          >
            <StatisticsModule
              visible={path === 'statisticModule'}
              onErrorRequestAction={onErrorRequestAction}
              key="statistic"
              loaderMethods={loaderMethods}
              rest={rest}
              path={path}
            />
          </TabContainer>
        </Content>
        <DrawerViewer onClose={this.onClose} visible={drawerView} />
      </>
    );
  }
}

export default ContentView;
