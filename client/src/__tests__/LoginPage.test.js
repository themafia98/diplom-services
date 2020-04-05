import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';

import { LoginPage } from '../Components/Pages/LoginPage/LoginPage';
import { initialState } from '../Redux/testStore';

describe('<LoginPage /> template', () => {
  test('Should be render', () => {
    const props = {
      addTab: () => {},
      router: {},
      ...initialState,
    };

    const LoginPageWrapper = shallow(<LoginPage {...props} />);
    expect(toJson(LoginPageWrapper)).toMatchSnapshot();

    expect(LoginPageWrapper.find('.enterSystem').simulate('click', [])).toBeTruthy();
    expect(toJson(LoginPageWrapper)).toMatchSnapshot();

    LoginPageWrapper.setState({
      loading: true,
    });

    expect(LoginPageWrapper.find('.enterSystem').prop('loading')).toEqual(true);
    expect(toJson(LoginPageWrapper)).toMatchSnapshot();

    expect(LoginPageWrapper.find('NavLink').simulate('click', [])).toBeTruthy();
    expect(toJson(LoginPageWrapper)).toMatchSnapshot();
  });
});
