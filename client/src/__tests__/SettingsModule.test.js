import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';

import { initialState } from '../Redux/testStore';
import { SettingsModule } from '../Components/Modules/SettingsModule';

describe('<SettingsModule /> template', () => {
  test('Should be render', () => {
    const props = {
      onErrorRequstAction: () => {},
      path: 'settingsModule',
      onSaveComponentState: () => {},
      router: { ...initialState.router },
    };

    const SettingsModuleWrapper = shallow(<SettingsModule {...props} />);
    expect(toJson(SettingsModuleWrapper)).toMatchSnapshot();

    /** TODO: need upgrade test for new settings component */
    // expect(
    //   SettingsModuleWrapper.findWhere(node => node.at(0) && node.hasClass('submit')).prop('disabled'),
    // ).toEqual(true);
    // expect(
    //   SettingsModuleWrapper.findWhere(node => node.at(0) && node.hasClass('submit')).simulate('click', []),
    // ).toBeTruthy();

    const arrayPanel = SettingsModuleWrapper.find('Collapse');

    arrayPanel.forEach((node, i) => {
      if (i === 0) expect(node.prop('bordered')).toEqual(true);
      else expect(node.prop('bordered')).toEqual(false);

      expect(node.simulate('click', []));
    });

    SettingsModuleWrapper.setState({ hasChange: true });
    expect(SettingsModuleWrapper.find('.submit')).toEqual({});

    expect(toJson(SettingsModuleWrapper)).toMatchSnapshot();
  });
});
