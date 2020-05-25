import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import config from '../config.json';
import ModalWindow from '../Components/ModalWindow';
import context from '../Models/context';
describe('<ModalWindow />', () => {
  test('Should works with mode', () => {
    const props = {
      onCaching: () => {},
      primaryKey: '',
      routeDataActive: {},
      mode: 'reg',
      path: '',
      typeRequst: '',
      keyTask: '',
      accessStatus: ['Открыт', 'Выполнен', 'Закрыт', 'В работе'],
      onUpdate: () => {},
      onEdit: () => {},
      onRejectEdit: () => {},
      modeControll: '',
      editableContent: '',
      modeEditContent: false,
      onCancelEditModeContent: () => {},
      onUpdateEditable: () => {},
      statusTaskValue: 'В работе',
    };
    const ModalWindowWrapper = mount(<ModalWindow {...props} />, { context });

    expect(toJson(ModalWindowWrapper)).toMatchSnapshot();
    expect(ModalWindowWrapper.find('Button').text()).toEqual('Регистрация');

    ModalWindowWrapper.find('Button').forEach((node) => {
      expect(node.simulate('click', [])).toBeTruthy();
    });

    const nextProps = {
      ...props,
      mode: '',
    };

    const ModalWindowWrapperNoMode = shallow(<ModalWindow {...nextProps} />);
    expect(toJson(ModalWindowWrapperNoMode)).toMatchSnapshot();
    expect(ModalWindowWrapperNoMode).toEqual({});

    const nextPropsMode = {
      ...props,
      mode: 'jur',
      typeState: 'statusTask',
    };

    const ModalWindowWrapperJurStatus = shallow(<ModalWindow {...nextPropsMode} />);
    expect(toJson(ModalWindowWrapperJurStatus)).toMatchSnapshot();

    const nextPropsModeEdit = {
      ...props,
      mode: 'jur',
      typeState: '',
      modeControll: 'edit',
      modeEditContent: true,
    };

    const ModalWindowWrapperJurEditMode = shallow(<ModalWindow {...nextPropsModeEdit} />);
    expect(toJson(ModalWindowWrapperJurEditMode)).toMatchSnapshot();

    const nextPropsModeEditFalse = {
      ...props,
      mode: 'jur',
      typeState: '',
      modeControll: 'edit',
      modeEditContent: false,
    };

    const ModalWindowWrapperJurEditModeFalse = shallow(<ModalWindow {...nextPropsModeEditFalse} />);
    expect(toJson(ModalWindowWrapperJurEditModeFalse)).toMatchSnapshot();

    const nextPropsModeEditBags = {
      ...props,
      mode: 'jur',
      typeState: '',
      modeControll: 'default',
      modeEditContent: true,
    };

    const ModalWindowWrapperJurEditModeBags = shallow(<ModalWindow {...nextPropsModeEditBags} />);
    expect(toJson(ModalWindowWrapperJurEditModeBags)).toMatchSnapshot();
  });
});
