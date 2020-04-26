import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { initialState } from '../Redux/testStore';
import { TaskModule } from '../Components/Modules/TaskModule/TaskModule';

describe('<TaskModule /> template', () => {
  test('Should be render', () => {
    const props = {
      onErrorRequestAction: () => {},
      setCurrentTab: () => {},
      path: 'taskModule_all',
      addTab: () => {},
      onOpenPageWithData: () => {},
      onLoadCurrentData: () => {},
      ...initialState,
      router: { ...initialState.router, routeData: { taskModule__all: {} } },
    };
    const TaskModuleWrapper = shallow(<TaskModule {...props} />);
    expect(toJson(TaskModuleWrapper)).toMatchSnapshot();

    expect(TaskModuleWrapper.find('.newTaskButton').simulate('click', [])).toBeTruthy();

    const nextProps = {
      ...props,
      path: '',
    };

    const TaskModuleWrapperNoPath = shallow(<TaskModule {...nextProps} />);
    expect(toJson(TaskModuleWrapperNoPath)).toMatchSnapshot();
  });
});
