import React from 'react';
import { EventEmitter } from 'events';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { HeaderView } from '../Components/HeaderView/HeaderView';
import { initialState } from '../Redux/testStore';
import context from '../Models/context';
describe('<HeaderView /> and children', () => {
  test('Should render', () => {
    const props = {
      ...initialState,
      dashboardStrem: new EventEmitter(),
      cbMenuTabHandler: () => {},
      activeTabs: [{ EUID: 'mainModule' }],
      activeTabEUID: 'mainModule',
      logout: () => {},
    };

    const HeaderViewWrapper = shallow(<HeaderView {...props} />, { context });
    expect(toJson(HeaderViewWrapper)).toMatchSnapshot();

    expect(HeaderViewWrapper.find('.tabsMenu').exists()).toBeTruthy();

    const nextProps = {
      ...props,
      activeTabs: [{ EUID: 'mainModule1' }],
    };

    const HeaderViewWrapperNewProps = shallow(<HeaderView {...nextProps} />);
    expect(HeaderViewWrapperNewProps).toMatchSnapshot();
  });
});
