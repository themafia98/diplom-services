import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { TaskView } from '../Components/Modules/TaskModule/TaskView/TaskView';
import { initialState } from '../Redux/testStore';

describe('<TaskView /> template', () => {
  test('Should be render with data', () => {
    const card = {
      key: 'testTask',
      name: 'Task1',
      description: 'asdasd',
      status: 'В работе',
      priority: 'Средний',
      author: 'Павел Петрович',
      editor: ['Павел Петрович', 'Гена Букин'],
      date: [],
    };
    const props = {
      onCaching: () => {},
      onUpdate: () => {},
      height: 800,
      data: { ...card },
      onLoadCurrentData: () => {},

      ...initialState,
      router: { ...initialState.router, routeDataActive: { ...card } },
    };
    const TaskViewWrapper = shallow(<TaskView {...props} />);
    expect(toJson(TaskViewWrapper)).toMatchSnapshot();

    const keys = Object.keys(card);

    keys.forEach((keyCard) => {
      if (keyCard === 'description') {
        expect(TaskViewWrapper.find('.descriptionContent').prop('children')).toEqual(card[keyCard]);
      } else if (keyCard === 'date') {
        if (card.date[0]) expect(TaskViewWrapper.find('.startDate').exists()).toBeTruthy();
        if (card.date[1]) expect(TaskViewWrapper.find('.endDate').exists()).toBeTruthy();
      } else {
        const resultTestFind = TaskViewWrapper.find(`.${keyCard}`).prop('children');
        if (keyCard === 'editor') {
          expect(resultTestFind).toEqual(card[keyCard].join(','));
        } else expect(resultTestFind).toEqual(card[keyCard]);
      }
    });

    TaskViewWrapper.setState({ modeControll: 'edit' });
    expect(TaskViewWrapper.find('.statusEdit')).toBeTruthy();

    if (card.description) expect(TaskViewWrapper.find('.description').simulate('click', [])).toBeTruthy();
  });
});
