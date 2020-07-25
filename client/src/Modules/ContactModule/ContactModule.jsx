import React from 'react';
import { contactModuleType } from './types';
import { connect } from 'react-redux';

import { loadCurrentData } from 'Redux/actions/routerActions/middleware';
import entityRender from 'Utils/Tools/entityRender';
import withRouter from 'Components/Helpers/withRouter';
import types from 'types.modules';
import { oneOfType } from 'Utils';
import { setStatus } from 'Redux/actions/publicActions';
import { compose } from 'redux';
import { withClientDb } from 'Models/ClientSideDatabase';

class ContactModule extends React.PureComponent {
  state = {
    isLoading: false,
  };

  static propTypes = contactModuleType;
  static defaultProps = {
    statusApp: '',
    udata: {},
    router: {},
    webSocket: null,
    visibilityPorta: false,
    onChangeVisibleAction: null,
  };

  componentDidMount = () => {
    const { onLoadCurrentData, path, type = Symbol(''), clientDB } = this.props;

    if (path === 'contactModule_feedback' && type === types.$sub_entrypoint_module) {
      onLoadCurrentData({
        path,
        storeLoad: 'news',
        methodRequst: 'GET',
        noCorsClient: false,
        useStore: true,
        clientDB,
      });
    }
  };

  checkBackground = (path, visible, mode = 'default') => {
    const { router: { activeTabs = [] } = {} } = this.props;
    if (mode === 'default') return !visible && activeTabs.some((actionTab) => actionTab === path);
  };

  componentDidUpdate = () => {
    const {
      router: { shouldUpdate = false, routeData = {} } = {},
      path,
      onLoadCurrentData,
      type = Symbol(''),
      clientDB,
    } = this.props;

    const { isLoading: isLoadingState = false } = this.state;

    const shouldUpdateList = routeData[path] && routeData[path]?.shouldUpdate;
    const isUnloadModule = shouldUpdate && !routeData[path]?.load;
    const { loading = false } = routeData[path] || {};

    const isCloseTabAction = !isUnloadModule && !shouldUpdateList && shouldUpdate && !loading;
    const isAvailable = path === 'contactModule_feedback' && type === types.$sub_entrypoint_module;

    if (!(isAvailable && !isLoadingState && (isUnloadModule || shouldUpdateList || isCloseTabAction))) {
      return;
    }

    this.setState(
      (state) => ({ ...state, isLoading: !state?.isLoading }),
      async () => {
        await onLoadCurrentData({
          path,
          storeLoad: 'news',
          methodRequst: 'GET',
          noCorsClient: false,
          useStore: true,
          clientDB,
        });

        this.setState({
          ...this.state,
          isLoading: false,
        });
      },
    );
  };

  renderContactsModules = () => {
    const {
      path,
      statusApp,
      router: { routeData = {}, activeTabs = [] } = {},
      router = {},
      udata,
      webSocket,
      visibilityPortal,
      onChangeVisibleAction,
      entitysList = [],
      type,
    } = this.props;

    const data = routeData[path] || {};
    const { load = false, news = [] } = routeData[path] || {};

    const isVisibleChatModal = visibilityPortal && path !== 'contactModule_chat';

    const subTabProps = {
      isPortal: visibilityPortal,
      onChangeVisibleAction,
      isTab: path === 'contactModule_chat',
      webSocket: webSocket,
      type: isVisibleChatModal ? 'modal' : type,
      data,
      isLoading: !load && !news.length,
      path,
      udata,
      statusApp,
      router,
    };

    const config = {
      viewModuleName: 'newsViewPageModule',
      moduleName: 'contactModule',
      validation: this.checkBackground,
      path,
      parentType: type,
      type: oneOfType(types.$sub_entrypoint_module, types.$entity_entrypoint),
    };

    const entityList = entityRender(
      activeTabs.filter((tab) => tab === entitysList),
      routeData,
      subTabProps,
      config,
    );
    return entityList.map(({ component = null }) => component);
  };
  render() {
    return (
      <div key="contactModule" className="contactModule">
        {this.renderContactsModules()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const {
    router = {},
    publicReducer: { udata = {}, appConfig },
  } = state;
  return { router, udata, appConfig };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoadCurrentData: (props) => dispatch(loadCurrentData(props)),
    onSetStatus: (props) => dispatch(setStatus(props)),
  };
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withClientDb, withRouter)(ContactModule);
