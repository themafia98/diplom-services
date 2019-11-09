import React from "react";
import PropTypes from "prop-types";
import { Input, Select } from "antd";
const { Option } = Select;
const RegistrationModal = ({ cbOnChangeSelect, cbOnChange }) => (
    <div>
        <Input onChange={cbOnChange} className="email" type="text" size="default" placeholder="email" />
        <Input onChange={cbOnChange} className="password" type="password" size="default" placeholder="password" />
        <Input onChange={cbOnChange} className="login" type="email" size="default" placeholder="login" />
        <Input onChange={cbOnChange} className="name" type="text" size="default" placeholder="name" />
        <Input onChange={cbOnChange} className="surname" type="text" size="default" placeholder="surname" />
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

RegistrationModal.propTypes = {
    cbOnChangeSelect: PropTypes.func.isRequired,
    cbOnChangeSelect: PropTypes.func.isRequired,
};

export default RegistrationModal;
