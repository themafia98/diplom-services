import React from "react";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import _ from "lodash";
import { getEditorJSON } from "../../../Utils/schema";
import "../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Button } from "antd";

class EditorTextarea extends React.Component {
    state = {
        contentState: null
    };

    componentDidMount = () => {
        const { mode = "", contentState = null } = this.props;
        if (contentState && !_.isEmpty(contentState)) {
            this.setState({
                contentState: contentState
            });
        }
    };

    componentDidUpdate = () => {
        const { clear = false, clearStatus = null, readOnly = false } = this.props;
        if (clear && !readOnly) {
            this.setState(
                {
                    contentState: convertFromRaw(getEditorJSON())
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
        const { mode = "", onPublish = null, clear = false, readOnly = false } = this.props;

        const readOnlyProps =
            readOnly && contentState
                ? {
                      contentState
                  }
                : {};

        return (
            <div className={["content", readOnly ? "readOnly" : null].join(" ")}>
                <Editor
                    readOnly={readOnly}
                    toolbarHidden={readOnly}
                    localization={{ locale: "ru" }}
                    wrapperClassName="editor-wrapper"
                    editorClassName="editor"
                    {...readOnlyProps}
                    onContentStateChange={this.onContentStateChange}
                />
                {mode === "createNewsEdit" && !readOnly ? (
                    <Button
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
