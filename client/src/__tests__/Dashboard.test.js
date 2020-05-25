// @ts-nocheck
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { Dashboard } from '../Pages/Dashboard/Dashboard';
import context from '../Models/context';
describe('<Dashboard /> main page', () => {
  test('Should render component', () => {
    const props = {
      addTab: () => {},
      removeTab: () => {},
      setCurrentTab: () => {},
      onLoadCurrentData: () => {},
      onErrorRequestAction: () => {},
      onLogoutAction: () => {},
      publicReducer: {
        status: 'online',
        prewStatus: 'online',
        requestError: null,
        caches: {},
      },
      router: {
        currentActionTab: 'MainModule',
        actionTabs: ['MainModule'],
        routeDataActive: null,
        routeData: { MainModule: { name: 'MainModule' } },
      },
      rest: {},
      firstConnect: false,
      udata: { _id: 'dasd', displayName: 'asdas' },
      onSetStatus: () => {},
      onClearCache: () => {},
      onShoudUpdate: () => {},
      onShowGuide: () => {},
      tabData: {},
    };
    const DashboardWrapper = shallow(<Dashboard {...props} />, { context });

    expect(DashboardWrapper.find('MenuView').prop('collapsed')).toEqual(true);
    expect(DashboardWrapper.find('ContentView').prop('path')).toEqual(props.router.currentActionTab);

    DashboardWrapper.setState({ collapsed: true });
    expect(DashboardWrapper.find('MenuView').prop('collapsed')).toBeTruthy();

    DashboardWrapper.setState({ collapsed: false });
    expect(DashboardWrapper.find('MenuView').prop('collapsed')).toEqual(false);

    DashboardWrapper.setState({ showLoader: true });
    expect(toJson(DashboardWrapper)).toMatchSnapshot();

    DashboardWrapper.setState({ showLoader: false });
    expect(toJson(DashboardWrapper)).toMatchSnapshot();

    DashboardWrapper.setState({ menuItems: [] });
    expect(toJson(DashboardWrapper)).toMatchSnapshot();
  });
});
