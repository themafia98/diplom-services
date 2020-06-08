import React from 'react';
import { contactModuleType } from './types';
import { connect } from 'react-redux';
import _ from 'lodash';

import { loadCurrentData } from 'Redux/actions/routerActions/middleware';
import entityRender from 'Utils/Tools/entityRender';
import withRouter from 'Components/withRouter';
import types from 'types';
import { oneOfType } from 'Utils';

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

  getContactContentByPath = (path) => {
    const {
      getBackground,
      statusApp,
      router: { routeData = {} } = {},
      router = {},
      udata,
      webSocket,
      visibilityPortal,
      onChangeVisibleAction,
      onSetStatus,
      entitysList = [],
      type,
    } = this.props;
    if (!path?.includes('contactModule'))
      return (
        <div
          className="_"
          style={{
            display: 'none',
          }}
        ></div>
      );

    const linkPath = _.isString(path) && path.includes('LINK') ? path.split('__')[1] || '' : '';
    const data = routeData[path] || routeData[linkPath] || {};
    const { load = false, news = [] } = routeData[path] || {};

    const entityLinkProps = linkPath
      ? {
          ...data,
        }
      : {};
    //const visibleEntity = (linkPath && path.includes(linkPath)) || path === 'contactModule_informationPage';
    const isVisibleChatModal = visibilityPortal && path !== 'contactModule_chat';

    const subTabProps = {
      isPortal: visibilityPortal,
      onChangeVisibleAction,
      isTab: path === 'contactModule_chat',
      webSocket: webSocket,
      type: isVisibleChatModal ? 'modal' : null,
      data,
      isLoading: !load && !news.length,
      path,
      linkPath,
      udata,
      statusApp,
      onSetStatus,
      router,
      ...entityLinkProps,
    };

    const config = {
      viewModuleName: 'newsViewPageModule',
      moduleName: 'contactModule',
      validation: getBackground,
      path,
      parentType: type,
      type: oneOfType(types.$sub_entrypoint_module, types.$entity_entrypoint),
    };

    const entityList = entityRender(entitysList, routeData, subTabProps, config);
    return entityList.map(({ component = null }) => component);
  };
  render() {
    const { path } = this.props;
    if (!path?.includes('contactModule')) return null;
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ContactModule));
