import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Layout } from 'antd';

import TabContainer from '../TabContainer';
import DrawerViewer from '../DrawerViewer';

import MainModule from '../Modules/MainModule';
import CabinetModule from '../Modules/CabinetModule';
import TaskModule from '../Modules/TaskModule';
import StatisticsModule from '../Modules/StatisticsModule';
import SettingsModule from '../Modules/SettingsModule';
import ContactModule from '../Modules/ContactModule';
import CustomersModule from '../Modules/CustomersModule';
import WikiModule from '../Modules/WikiModule';

import uuid from 'uuid/v4';

const { Content } = Layout;

class ContentView extends React.Component {
  state = {
    drawerView: false,
    key: null,
  };

  static propTypes = {
    dashboardStrem: PropTypes.object.isRequired,
    setCurrentTab: PropTypes.func.isRequired,
    updateLoader: PropTypes.func.isRequired,
    onErrorRequstAction: PropTypes.func.isRequired,

    path: PropTypes.string.isRequired,
  };

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
    if (
      nextProps.path !== this.props.path ||
      nextState.key !== this.state.key ||
      nextState.drawerView !== this.state.drawerView
    ) {
      return true;
    } else return false;
  };

  componentWillUnmount = () => {
    const { dashboardStrem = null } = this.props;
    document.removeEventListener('keydown', this.disableF5);
    dashboardStrem.off('EventUpdate', this.updateFunction);
  };

  getBackground(module) {
    switch (module) {
      case 'mainModule':
        return this.checkBackground('mainModule');
      case 'cabientModule':
        return this.checkBackground('cabinetModule');
      case 'taskModule':
        return this.checkBackground('taskModule');
      case 'contactModule':
        return this.checkBackground('contactModule');
      case 'customersModule':
        return this.checkBackground('customersModule');
      case 'settingsModule':
        return this.checkBackground('settingsModule');
      case 'statisticModule':
        return this.checkBackground('statisticModule');
      case 'wikiModule':
        return this.checkBackground('wikiModule');
      default: {
        break;
      }
    }
  }

  checkBackground = path => {
    const { actionTabs = [] } = this.props;
    return actionTabs.some(actionTab => actionTab.startsWith(path) || actionTab === path);
  };

  updateFunction = _.debounce(forceUpdate => {
    const { updateLoader } = this.props;
    this.setState({ ...this.state, key: uuid() }, () => {
      if (forceUpdate) {
        updateLoader();
      }
    });
  }, 300);

  disableF5 = event => {
    if ((event.which || event.keyCode) === 113) {
      return this.setState({ ...this.state, drawerView: !this.state.drawerView });
    }
    if ((event.which || event.keyCode) === 116) {
      event.preventDefault();
      this.updateFunction(true);
    }
  };

  onClose = event => {
    return this.setState({ ...this.state, drawerView: false });
  };

  render() {
    const { path, onErrorRequstAction, setCurrentTab, actionTabs, router, statusApp, rest } = this.props;
    const { drawerView, key } = this.state;

    if (!key) return <div>no menu</div>;

    return (
      <React.Fragment>
        <Content key={key}>
          <TabContainer
            key="mainModule"
            isBackground={this.getBackground('mainModule')}
            visible={path === 'mainModule'}
          >
            <MainModule
              visible={path === 'mainModule'}
              rest={rest}
              onErrorRequstAction={onErrorRequstAction}
              key="mainModule"
            />
          </TabContainer>
          <TabContainer
            key="cabinet"
            isBackground={this.getBackground('cabinetModule')}
            visible={path === 'cabinetModule'}
          >
            <CabinetModule
              visible={path === 'cabinetModule'}
              rest={rest}
              onErrorRequstAction={onErrorRequstAction}
              key="cabinet"
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
              onErrorRequstAction={onErrorRequstAction}
              setCurrentTab={setCurrentTab}
              key="taskModule"
              rest={rest}
              path={path}
            />
          </TabContainer>
          <TabContainer isBackground={this.getBackground('wikiModule')} visible={path === 'wikiModule'}>
            <WikiModule
              visible={path === 'wikiModule'}
              onErrorRequstAction={onErrorRequstAction}
              key="wikiModule"
              path={path}
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
              onErrorRequstAction={onErrorRequstAction}
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
              onErrorRequstAction={onErrorRequstAction}
              actionTabs={actionTabs}
              rest={rest}
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
              onErrorRequstAction={onErrorRequstAction}
              key="settings"
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
              onErrorRequstAction={onErrorRequstAction}
              key="statistic"
              rest={rest}
              path={path}
            />
          </TabContainer>
        </Content>
        <DrawerViewer onClose={this.onClose} visible={drawerView} />
      </React.Fragment>
    );
  }
}

export default ContentView;
