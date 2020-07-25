import React from 'react';
import { customersModuleType } from './types';

import TabContainer from 'Components/TabContainer';
import Contacts from './Contacts';
import { connect } from 'react-redux';
import { setStatus } from 'Redux/actions/publicActions';
import { compose } from 'redux';
import withRouter from 'Components/Helpers/withRouter/withRouter';
import entityRender from 'Utils/Tools/entityRender';
import types from 'types.modules';

class CustomersModule extends React.PureComponent {
  static propTypes = customersModuleType;

  checkBackground = (path) => {
    const { activeTabs = [] } = this.props;
    return activeTabs.some((actionTab) => actionTab.startsWith(path) || actionTab === path);
  };

  renderCustomers = () => {
    const {
      path,
      statusApp,
      router: { routeData = {} } = {},
      router = {},
      udata,
      webSocket,
      visibilityPortal,
      entitysList = [],
      type,
    } = this.props;

    const subTabProps = {
      isPortal: visibilityPortal,
      webSocket: webSocket,
      type,
      path,
      udata,
      statusApp,
      router,
    };

    const config = {
      moduleName: 'customersModule',
      validation: this.checkBackground,
      path,
      parentType: type,
      type: types.$sub_entrypoint_module,
    };

    const entityList = entityRender(entitysList, routeData, subTabProps, config);
    return entityList.map(({ component = null }) => component);
  };

  render() {
    return <div className="customersModule">{this.renderCustomers()}</div>;
  }
}

const mapStateToProps = (state) => {
  const {
    publicReducer: { appConfig, udata },
  } = state;
  return { appConfig, udata };
};

export default compose(connect(mapStateToProps), withRouter)(CustomersModule);
