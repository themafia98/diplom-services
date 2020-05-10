import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { TaskView } from '../Modules/TaskModule/TaskView/TaskView';
import { initialState } from '../Redux/testStore';
import context from '../Models/context';
describe('<TaskView /> template', () => {
  test('Should be render with data', () => {
    const card = {
      _id: 'asdas',
      key: 'testTask',
      name: 'Task1',
      description: 'asdasd',
      status: 'В работе',
      priority: 'Средний',
      author: 'Павел Петрович',
      editor: ['Павел Петрович', 'Гена Букин'],
      comments: [],
      authorName: 'asdas',
      date: [],
    };
    const props = {
      onCaching: () => {},
      onUpdate: () => {},
      height: 800,
      data: { ...card },
      onLoadCurrentData: () => {},
      uuid: 'asd',
      rest: {},
      isBackground: false,
      visible: true,
      onLoadCacheData: () => {},
      udata: { _id: 'adasd', displayName: 'asdas' },
      modeControllEdit: { ...card },
      ...initialState,
      router: { ...initialState.router, routeDataActive: { ...card } },
    };
    const TaskViewWrapper = shallow(<TaskView {...props} />, { context });
    expect(toJson(TaskViewWrapper)).toMatchSnapshot();

    const keys = Object.keys(card);

    keys.forEach((keyCard) => {
      if (keyCard === 'description') {
      } else if (keyCard === 'date') {
        if (card.date[0]) expect(TaskViewWrapper.find('.startDate').exists()).toBeTruthy();

        if (card.date[1]) expect(TaskViewWrapper.find('.endDate').exists()).toBeTruthy();
      }
    });

    TaskViewWrapper.setState({ modeControll: 'edit' });
    expect(TaskViewWrapper.find('.statusEdit')).toBeTruthy();

    // if (card.description) expect(TaskViewWrapper.find('.description').simulate('click', [])).toEqual(0);
  });
});
