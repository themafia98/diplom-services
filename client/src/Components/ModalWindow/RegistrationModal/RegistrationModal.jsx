import React from 'react';
import { formRegType } from '../types';
import PropTypes from 'prop-types';
import { Input, Select } from 'antd';
const { Option } = Select;
const RegistrationModal = ({ cbOnChangeSelect, cbOnChange }) => (
  <div>
    <Input
      name="email"
      onChange={cbOnChange}
      className="email"
      type="text"
      size="default"
      placeholder="email"
    />
    <Input
      name="password"
      onChange={cbOnChange}
      className="password"
      type="password"
      size="default"
      placeholder="password"
    />

    <Input name="name" onChange={cbOnChange} className="name" type="text" size="default" placeholder="name" />
    <Input
      name="surname"
      onChange={cbOnChange}
      className="surname"
      type="text"
      size="default"
      placeholder="surname"
    />
    <Select
      onChange={cbOnChangeSelect}
      className="selectDepartament"
      placeholder="Select a departament"
      optionFilterProp="depart"
    >
      <Option value="Admin">Admin</Option>
      <Option value="Doctor">Doctor</Option>
    </Select>
  </div>
);

export default RegistrationModal;
