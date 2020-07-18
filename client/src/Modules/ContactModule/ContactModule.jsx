import React from 'react';
import { contactModuleType } from './types';
import { connect } from 'react-redux';

import { loadCurrentData } from 'Redux/actions/routerActions/middleware';
import entityRender from 'Utils/Tools/entityRender';
import withRouter from 'Components/Helpers/withRouter';
import types from 'types.modules';
import { oneOfType } from 'Utils';
import { setStatus } from 'Redux/actions/publicActions';

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
    const { onLoadCurrentData, path, type = Symbol('') } = this.props;

    if (path === 'contactModule_feedback' && type === types.$sub_entrypoint_module) {
      onLoadCurrentData({
        path,
        storeLoad: 'news',
        methodRequst: 'GET',
        noCorsClient: false,
        useStore: true,
      });
    }
  };

  /** TODO: should rework re-load data */
  // componentDidUpdate = () => {
  //   const {
  //     router: { shouldUpdate = false, routeData = {} } = {},
  //     path,
  //     onLoadCurrentData,
  //     type = Symbol(''),
  //   } = this.props;

  //   const { initModule = false } = this.state;
  //   const isUpdate = shouldUpdate && routeData[path]?.load;
  //   const shoudInit = path && !routeData[path] && !initModule;

  //   const isAvailable = path === 'contactModule_feedback' && type === types.$sub_entrypoint_module;

  //   if (!isAvailable && (!isUpdate || !shoudInit)) return;

  //   if (!routeData[path] && !initModule) {
  //     this.setState({
  //       ...this.state,
  //       initModule: true,
  //     });
  //   }

  //   onLoadCurrentData({
  //     path,
  //     storeLoad: 'news',
  //     methodRequst: 'GET',
  //     noCorsClient: false,
  //     useStore: true,
  //   });
  // };
  /***/

  getContactContentByPath = (path) => {
    const {
      getBackground,
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

    if (!path?.includes('contactModule')) return <div className="invalid-contactModule"></div>;

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
      validation: getBackground,
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
    onLoadCurrentData: (props) => dispatch(loadCurrentData(props)),
    onSetStatus: (props) => dispatch(setStatus(props)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ContactModule));
