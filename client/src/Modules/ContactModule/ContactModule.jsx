// @ts-nocheck
import React from 'react';
import { contactModuleType } from './types';
import { connect } from 'react-redux';
import _ from 'lodash';

import { loadCurrentData } from '../../Redux/actions/routerActions/middleware';

import { routeParser } from '../../Utils';
import TabContainer from '../../Components/TabContainer';
import Chat from './Chat';
import News from './News';
import NewsViewPage from './News/NewsViewPage';
import CreateNews from './News/CreateNews';

class ContactModule extends React.PureComponent {
  static propTypes = contactModuleType;
  static defaultProps = {
    statusApp: '',
    udata: {},
    router: {},
    webSocket: null,
    visibilityPorta: false,
    onChangeVisibleAction: null,
    onSetStatus: null,
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
        noCorsClient: false,
        useStore: true,
      });
    }
  };

  componentDidUpdate = () => {
    const { router: { shouldUpdate = false, routeData = {} } = {}, path, onLoadCurrentData } = this.props;
    const { initModule = false } = this.state;
    const isUpdate = shouldUpdate && routeData[path]?.load;
    const shoudInit = path && !routeData[path] && !initModule;
    const isAvailable = path === 'contactModule_feedback';
    if (isAvailable && (isUpdate || shoudInit)) {
      if (!routeData[path] && !initModule) {
        this.setState({
          initModule: true,
        });
      }

      onLoadCurrentData({
        path,
        storeLoad: 'news',
        methodRequst: 'GET',
        noCorsClient: false,
        useStore: true,
      });
    }
  };

  renderNewsView = () => {
    const {
      router: { currentActionTab, routeDataActive: { key: keyEntity = '', listdata = {} } = {} } = {},
      actionTabs = [],
    } = this.props;

    const filterActionTab = actionTabs.filter((tab) => tab.includes('_informationPage__'));
    const itemsKeys = filterActionTab.reduce((tabList, tab) => {
      const route = routeParser({ pageType: 'moduleItem', path: tab });
      if (typeof route !== 'string' && route.itemId) {
        return [...tabList, route.itemId];
      } else return tabList;
    }, []);

    return itemsKeys
      .map((key) => {
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

  getContactContentByPath = (path) => {
    const {
      getBackground,
      statusApp,
      router: { routeData = {} } = {},
      udata,
      webSocket,
      visibilityPortal,
      onChangeVisibleAction,
      onSetStatus,
    } = this.props;
    const isBackgroundChat = getBackground('contactModule_chat');
    const isBackgroundNews = getBackground('contactModule_feedback');
    const isBackgroundInfoPage = getBackground('contactModule_informationPage');
    const isBackgroundCreateNews = getBackground('contactModule_createNews');

    const linkPath = _.isString(path) ? path.split('__')[1] || '' : '';
    const data = routeData[path] || routeData[linkPath] || {};
    const { load = false, news = [] } = routeData[path] || {};

    const entityLinkProps = linkPath
      ? {
          ...data,
        }
      : {};
    const visibleEntity = (linkPath && path.includes(linkPath)) || path === 'contactModule_informationPage';
    const isVisibleChatModal = visibilityPortal && path !== 'contactModule_chat';

    return (
      <>
        <TabContainer
          isBackground={isBackgroundChat}
          isPortal={visibilityPortal}
          onChangeVisibleAction={onChangeVisibleAction}
          isTab={path === 'contactModule_chat'}
          visible={isVisibleChatModal || path === 'contactModule_chat'}
        >
          <Chat
            key="chatModule"
            isBackground={isBackgroundChat}
            webSocket={webSocket}
            type={isVisibleChatModal ? 'modal' : null}
            visible={visibilityPortal || path === 'contactModule_chat'}
          />
        </TabContainer>
        <TabContainer isBackground={isBackgroundNews} visible={path === 'contactModule_feedback'}>
          <News
            data={data}
            isLoading={!load && !news.length}
            key="newsModule"
            isBackground={isBackgroundNews}
            path={path}
            visible={path === 'contactModule_feedback'}
          />
        </TabContainer>
        <TabContainer key={`${linkPath}-tab`} isBackground={isBackgroundInfoPage} visible={visibleEntity}>
          <NewsViewPage
            key={linkPath}
            isBackground={isBackgroundInfoPage}
            visible={visibleEntity}
            {...entityLinkProps}
          />
        </TabContainer>
        <TabContainer isBackground={isBackgroundCreateNews} visible={path === 'contactModule_createNews'}>
          <CreateNews
            readOnly={statusApp === 'offline'}
            key="createNews"
            udata={udata}
            statusApp={statusApp}
            onSetStatus={onSetStatus}
            isBackground={isBackgroundInfoPage}
            visible={path === 'contactModule_createNews'}
          />
        </TabContainer>
        {this.renderNewsView()}
      </>
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

const mapStateToProps = (state) => {
  const {
    router = {},
    publicReducer: { udata = {} },
  } = state;
  return { router, udata };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoadCurrentData: (props) => dispatch(loadCurrentData({ ...props })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactModule);
