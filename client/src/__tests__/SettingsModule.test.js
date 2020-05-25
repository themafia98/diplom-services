import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';

import { initialState } from '../Redux/testStore';
import { SettingsModule } from '../Modules/SettingsModule/SettingsModule';
import context from '../Models/context';
describe('<SettingsModule /> template', () => {
  test('Should be render', () => {
    const props = {
      onErrorRequestAction: () => {},
      path: 'settingsModule',
      statusApp: 'online',
      visible: true,
      loaderMethods: {},
      rest: {},
      shouldUpdate: false,
      onUpdateUdata: () => {},
      onCaching: () => {},
      onSetStatus: () => {},
      emailValue: '',
      onSaveCache: () => {},
      telValue: '',
      isHidePhone: false,
      isHideEmail: false,
      onSaveComponentState: () => {},
      router: { ...initialState.router },
    };

    const SettingsModuleWrapper = shallow(<SettingsModule {...props} />, { context });
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
