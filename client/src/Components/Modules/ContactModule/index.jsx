import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';

import { loadCurrentData } from '../../../Redux/actions/routerActions/middleware';

import { routeParser } from '../../../Utils';
import TabContainer from '../../TabContainer';
import Chat from './Chat';
import News from './News';
import NewsViewPage from './News/NewsViewPage';
import CreateNews from './News/CreateNews';

class ContactModule extends React.PureComponent {
  static propTypes = {
    onErrorRequstAction: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
  };

  state = {
    isLoading: false,
  };

  componentDidMount = () => {
    const { onLoadCurrentData, path } = this.props;

    if (path === 'contactModule_feedback') {
      onLoadCurrentData({
        path,
        storeLoad: 'news',
        methodRequst: 'GET',
        noCorsClient: true,
        useStore: true,
      });
    }
  };

  componentDidUpdate = () => {
    const { router: { shouldUpdate = false, routeData = {} } = {}, path, onLoadCurrentData } = this.props;

    if (path === 'contactModule_feedback' && shouldUpdate && routeData[path.split('_')[0]]?.load) {
      onLoadCurrentData({
        path,
        storeLoad: 'news',
        methodRequst: 'GET',
        noCorsClient: true,
        useStore: true,
      });
    }
  };

  renderNewsView = () => {
    const {
      router: { currentActionTab, routeDataActive: { key: keyEntity = '', listdata = {} } = {} } = {},
      actionTabs = [],
    } = this.props;

    const filterActionTab = actionTabs.filter(tab => tab.includes('_informationPage__'));
    const itemsKeys = filterActionTab
      .map(it => {
        const route = routeParser({ pageType: 'moduleItem', path: it });
        if (typeof route !== 'string' && route.itemId) {
          return route.itemId;
        } else return null;
      })
      .filter(Boolean);

    return itemsKeys
      .map(key => {
        const route = routeParser({ pageType: 'moduleItem', path: currentActionTab });

        if (!_.isEmpty(listdata) && keyEntity && key) {
          const { content = {}, title = '', _id } = listdata;
          return (
            <TabContainer key={key} visible={route.itemId === key && currentActionTab.includes(key)}>
              <NewsViewPage id={_id} title={title} content={content} key={key} />
            </TabContainer>
          );
        } else return null;
      })
      .filter(Boolean);
  };

  checkBackground = path => {
    const { actionTabs = [] } = this.props;
    return actionTabs.some(actionTab => actionTab.startsWith(path) || actionTab === path);
  };

  getContactContentByPath = path => {
    const isBackgroundChat = this.checkBackground('contactModule_chat');
    const isBackgrounNews = this.checkBackground('contactModule_feedback');
    const isBackgroundInfoPage = this.checkBackground('contactModule_informationPage');
    const isBackgroundCreateNews = this.checkBackground('contactModule_createNews');
    const { statusApp = '', router: { routeData = {} } = {} } = this.props;
    const data = routeData[path] || {};
    const { load = false, news = [] } = routeData['contactModule'] || {};

    return (
      <React.Fragment>
        <TabContainer isBackground={isBackgroundChat} visible={path === 'contactModule_chat'}>
          <Chat key="chatModule" isBackground={isBackgroundChat} visible={path === 'contactModule_chat'} />
        </TabContainer>
        <TabContainer isBackground={isBackgrounNews} visible={path === 'contactModule_feedback'}>
          <News
            data={data}
            isLoading={!load && !news.length}
            key="newsModule"
            isBackground={isBackgrounNews}
            visible={path === 'contactModule_feedback'}
          />
        </TabContainer>
        <TabContainer isBackground={isBackgroundInfoPage} visible={path === 'contactModule_informationPage'}>
          <NewsViewPage
            key="newViewPageModule"
            isBackground={isBackgroundInfoPage}
            visible={path === 'contactModule_informationPage'}
          />
        </TabContainer>
        <TabContainer isBackground={isBackgroundCreateNews} visible={path === 'contactModule_createNews'}>
          <CreateNews
            readOnly={statusApp === 'offline'}
            key="createNews"
            statusApp={statusApp}
            isBackground={isBackgroundInfoPage}
            visible={path === 'contactModule_createNews'}
          />
        </TabContainer>
        {this.renderNewsView()}
      </React.Fragment>
    );
  };
  render() {
    const { path } = this.props;
    const component = this.getContactContentByPath(path);
    return (
      <div key="contactModule" className="contactModule">
        {component ? component : null}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { router = {} } = state;
  return { router };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadCurrentData: props => dispatch(loadCurrentData({ ...props })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactModule);
