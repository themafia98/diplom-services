import React from "react";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { getEditorJSON } from "../../../Utils/schema";
import "../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Button } from "antd";

class EditorTextarea extends React.Component {
    state = {
        contentState: null
    };

    componentDidMount = () => {
        const { mode = "", contentEditor: contentProps = null } = this.props;
        const { contentState } = this.state;
        if (mode === "createNewsEdit" && contentState) {
            this.setState({
                contentState: convertFromRaw(contentProps ? contentProps : getEditorJSON())
            });
        }
    };

    componentDidUpdate = () => {
        const { clear = false, clearStatus = null } = this.props;
        if (clear) {
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
        const { readOnly = false, contentState = null } = this.state;
        const { mode = "", onPublish = null, clear = false } = this.props;

        return (
            <React.Fragment>
                <Editor
                    readOnly={readOnly}
                    localization={{ locale: "ru" }}
                    wrapperClassName="editor-wrapper"
                    editorClassName="editor"
                    onContentStateChange={this.onContentStateChange}
                />
                {mode === "createNewsEdit" ? (
                    <Button onClick={onPublish.bind(this, contentState)} className="createNews-button" type="primary">
                        Опубликовать
                    </Button>
                ) : null}
            </React.Fragment>
        );
    }
}

export default EditorTextarea;
