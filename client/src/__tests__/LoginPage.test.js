// @ts-nocheck
import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';

import { LoginPage } from '../Pages/LoginPage/LoginPage';
import { initialState } from '../Redux/testStore';
import context from '../Models/context';
describe('<LoginPage /> template', () => {
  test('Should be render', () => {
    const props = {
      addTab: () => {},
      router: {},
      location: { pathname: '/' },
      history: {},
      match: {},
      udata: { _id: 'dasd', displayName: 'asdas' },
      setCurrentTab: () => {},
      onLoadUdata: () => {},
      ...initialState,
    };

    const LoginPageWrapper = shallow(<LoginPage {...props} />, { contextType: {} }, { context });
    expect(toJson(LoginPageWrapper)).toMatchSnapshot();

    expect(LoginPageWrapper.find('.enterSystem').simulate('click', [])).toBeTruthy();
    expect(toJson(LoginPageWrapper)).toMatchSnapshot();

    LoginPageWrapper.setState({
      loading: true,
    });

    expect(LoginPageWrapper.find('.enterSystem').prop('loading')).toEqual(true);
    expect(toJson(LoginPageWrapper)).toMatchSnapshot();

    expect(LoginPageWrapper.find('.recovory-link').simulate('click', [])).toBeTruthy();
    expect(toJson(LoginPageWrapper)).toMatchSnapshot();
  });
});
