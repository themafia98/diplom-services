import React from "react";
import { Input } from "antd";
import EditorTextarea from "./EditorTextarea";
const { TextArea } = Input;

const Textarea = ({
    value = null,
    className = null,
    row = 5,
    onKeyDown = null,
    onClick = null,
    onChange = null,
    editor = false,
    defaultValue = "",
    name = null
}) => {
    const valueProps = value || value === "" ? { value } : {};

    return (
        <React.Fragment>
            {editor ? (
                <EditorTextarea defaultValue={defaultValue} onChange={onChange} {...valueProps} />
            ) : (
                <TextArea
                    className={[className, "defaultTextArea"].join(" ")}
                    row={row}
                    onKeyDown={onKeyDown}
                    onClick={onClick}
                    onChange={onChange}
                    name={name}
                    {...valueProps}
                />
            )}
        </React.Fragment>
    );
};
export default Textarea;
