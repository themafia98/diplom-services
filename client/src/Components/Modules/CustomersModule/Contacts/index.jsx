import React from 'react';
import TitleModule from '../../../TitleModule';

class Contacts extends React.PureComponent {
  render() {
    return (
      <div className="contactsModule">
        <TitleModule classNameTitle="contactsModuleTitle" title="Контакты" />
      </div>
    );
  }
}
export default Contacts;
