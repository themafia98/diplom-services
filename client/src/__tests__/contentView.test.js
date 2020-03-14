import React from 'react';
import { EventEmitter } from 'events';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import ContentView from '../Components/ContentView/index';

describe('<ContentView />', () => {
  test('Should works with state', () => {
    const props = {
      dashboardStrem: new EventEmitter(),
      setCurrentTab: () => {},
      updateLoader: () => {},
      onErrorRequstAction: () => {},
      path: 'mainModule',
    };
    const ContentViewWrapper = shallow(<ContentView {...props} />);

    toJson(ContentViewWrapper);

    ContentViewWrapper.setState({ drawerView: true }, () => {
      expect(ContentViewWrapper.find('DrawerViewer').prop('visible')).toEqual(true);
    });

    ContentViewWrapper.setState({ drawerView: false });
    expect(ContentViewWrapper.find('DrawerViewer').prop('visible')).toEqual(false);
  });
});
