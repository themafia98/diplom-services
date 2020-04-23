// @ts-nocheck
import React from 'react';
import { customersModuleType } from './types';

import TabContainer from '../../Components/TabContainer';
import Contacts from './Contacts';

class CustomersModule extends React.PureComponent {
  static propTypes = customersModuleType;

  checkBackground = (path) => {
    const { actionTabs = [] } = this.props;
    return actionTabs.some((actionTab) => actionTab.startsWith(path) || actionTab === path);
  };

  getComponentByPath = (path) => {
    const { router = {}, onSetStatus } = this.props;
    if (path) {
      const isBackgroundContacts = this.checkBackground('customersModule_contacts');
      return (
        <React.Fragment>
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
        </React.Fragment>
      );
    }
  };
  render() {
    const { path } = this.props;
    const component = this.getComponentByPath(path);
    return <div className="contactModule">{component ? component : null}</div>;
  }
}
export default CustomersModule;