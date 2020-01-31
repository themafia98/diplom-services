import React from "react";
import { convertFromRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import _ from "lodash";

import "../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Button } from "antd";

import modelContext from '../../../Models/context';

class EditorTextarea extends React.Component {
    state = {
        contentState: null
    };

    static contextType = modelContext;

    componentDidMount = () => {
        const { contentState = null } = this.props;
        if (contentState && !_.isEmpty(contentState)) {
            this.setState({
                contentState: contentState
            });
        }
    };

    componentDidUpdate = () => {
        const { clear = false, clearStatus = null, readOnly = false } = this.props;
        const { schema = {} } = this.context;
        if (clear && !readOnly) {
            this.setState(
                {
                    contentState: convertFromRaw(schema.getEditorJSON())
                },
                () => {
                    if (clearStatus) clearStatus(false);
                }
            );
        }
    };

    onContentStateChange = contentState => {
        this.setState({
            contentState: contentState
        });
    };

    render() {
        const { contentState = null } = this.state;
        const { mode = "", onPublish = null, readOnly = false, disabled = false } = this.props;

        const readOnlyProps =
            readOnly && contentState
                ? {
                    contentState
                }
                : {};

        return (
            <div className={["content", readOnly ? "readOnly" : null].join(" ")}>
                <Editor
                    readOnly={disabled || readOnly}
                    toolbarHidden={readOnly}
                    localization={{ locale: "ru" }}
                    wrapperClassName="editor-wrapper"
                    editorClassName="editor"
                    {...readOnlyProps}
                    onContentStateChange={this.onContentStateChange}
                />
                {mode === "createNewsEdit" && !readOnly ? (
                    <Button
                        disabled={disabled}
                        onClick={onPublish ? onPublish.bind(this, contentState) : null}
                        className="createNews-button"
                        type="primary"
                    >
                        Опубликовать
                    </Button>
                ) : null}
            </div>
        );
    }
}

export default EditorTextarea;
