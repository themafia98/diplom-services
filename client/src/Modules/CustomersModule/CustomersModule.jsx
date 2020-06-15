import React from 'react';
import { customersModuleType } from './types';

import TabContainer from 'Components/TabContainer';
import Contacts from './Contacts';
import { connect } from 'react-redux';
import { setStatus } from 'Redux/actions/publicActions';

class CustomersModule extends React.PureComponent {
  static propTypes = customersModuleType;

  checkBackground = (path) => {
    const { activeTabs = [] } = this.props;
    return activeTabs.some((actionTab) => actionTab.startsWith(path) || actionTab === path);
  };

  getComponentByPath = (path) => {
    const { router = {}, onSetStatus } = this.props;
    if (path) {
      const isBackgroundContacts = this.checkBackground('customersModule_contacts');
      return (
        <>
          <TabContainer isBackground={isBackgroundContacts} visible={path === 'customersModule_contacts'}>
            <Contacts
              key="contacts_module"
              isBackground={isBackgroundContacts}
              router={router}
              onSetStatus={onSetStatus}
              path={path}
              visible={path === 'customersModule_contacts'}
            />
          </TabContainer>
        </>
      );
    }
  };
  render() {
    const { path } = this.props;
    const component = this.getComponentByPath(path);
    return <div className="contactModule">{component ? component : null}</div>;
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSetStatus: (status) => dispatch(setStatus({ statusRequst: status })),
  };
};

export default connect(null, mapDispatchToProps)(CustomersModule);
