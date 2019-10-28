import React from "react";
import { Button, Input, Select } from "antd";
const { Option } = Select;
const RegistrationModal = () => (
    <div>
        <Input onChange={this.onChange} className="email" type="text" size="default" placeholder="email" />
        <Input onChange={this.onChange} className="password" type="password" size="default" placeholder="password" />
        <Input onChange={this.onChange} className="login" type="email" size="default" placeholder="login" />
        <Input onChange={this.onChange} className="name" type="text" size="default" placeholder="name" />
        <Input onChange={this.onChange} className="surname" type="text" size="default" placeholder="surname" />
        <Select
            onChange={this.onChangeSelect}
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
