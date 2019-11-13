import React from "react";
import { Input } from "antd";

const { TextArea } = Input;

const Textarea = ({
    value = null,
    className = null,
    row = 5,
    onKeyDown = null,
    onClick = null,
    onChange = null,
    name = null
}) => {
    const valueProps = value || value === "" ? { value } : {};
    console.log(row);
    return (
        <TextArea
            className={["defaultTextArea", className].join(" ")}
            row={row}
            onKeyDown={onKeyDown}
            onClick={onClick}
            onChange={onChange}
            name={name}
            {...valueProps}
        />
    );
};
export default Textarea;
